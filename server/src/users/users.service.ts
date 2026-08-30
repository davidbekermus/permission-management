import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRoleEntry } from './schemas/user.schema';
import {
  Role,
  assertIsAnomalyAdmin,
  isAdminRole,
  isAnomalyAdmin,
  getFlowFromRole,
  getRolesForFlow,
} from '../common/utils/roles.util';
import {
  RoleSubmission,
  RoleSubmissionDocument,
} from '../role-submissions/schemas/role-submission.schema';
import { RoleSubmissionStatus } from '../role-submissions/types/role-submission.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(RoleSubmission.name)
    private readonly roleSubmissionModel: Model<RoleSubmissionDocument>,
  ) {}

  /** Return all users (up to 20), optionally filtered by username, roles, and sorted by date. */
  async findAll(
    requesterRoles: Role[],
    username?: string,
    roles?: Role[],
    sort?: 'asc' | 'desc',
  ): Promise<UserDocument[]> {
    const filter: Record<string, unknown> = {};
    if (username) filter.username = { $regex: username, $options: 'i' };

    if (requesterRoles.includes(Role.ANOMALY_ADMIN)) {
      if (roles?.length) filter['roles.role'] = { $in: roles };
    } else {
      const scopedRoles = this.getRolesInAdminScope(requesterRoles);
      const effectiveRoles = roles?.length
        ? roles.filter((role) => scopedRoles.includes(role))
        : scopedRoles;
      if (effectiveRoles.length === 0) return [];
      filter['roles.role'] = { $in: effectiveRoles };
    }
    const sortOrder = sort === 'asc' ? 1 : -1;
    return this.userModel.find(filter).sort({ createdAt: sortOrder }).limit(20).exec();
  }

  /** Find a user by username — throws NotFoundException if not found. */
  async findByUsername(username: string, requesterRoles?: Role[]): Promise<UserDocument> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) throw new NotFoundException(`User "${username}" not found`);

    if (requesterRoles && !requesterRoles.includes(Role.ANOMALY_ADMIN)) {
      const scopedRoles = this.getRolesInAdminScope(requesterRoles);
      const isVisible = user.roles.some((entry) => scopedRoles.includes(entry.role));
      if (!isVisible) throw new NotFoundException(`User "${username}" not found`);
    }
    
    return user;
  }

  /**
   * Create a new user with the given roles.
   *
   * Pass requesterRoles to enforce that the requester is ANOMALY_ADMIN (admin API path).
   * Omit requesterRoles for trusted internal calls (seed, permission approval).
   * grantedBy identifies who is creating the user (defaults to 'system').
   */
  async createUser(
    username: string,
    roles: Role[],
    requesterRoles?: Role[],
    grantedBy = 'system',
  ): Promise<UserDocument> {
    if (requesterRoles) {
      assertIsAnomalyAdmin(requesterRoles, 'assign');
    }
    const existing = await this.userModel.findOne({ username }).exec();
    if (existing) {
      throw new ConflictException(`User "${username}" already exists`);
    }
    const grantedAt = new Date();
    const roleEntries: UserRoleEntry[] = roles.map((role) => ({ role, grantedBy, grantedAt }));
    const user = new this.userModel({ username, roles: roleEntries });
    const saved = await user.save();
    await this.recordRoleSubmissions(
      username,
      roles,
      RoleSubmissionStatus.APPROVED,
      grantedBy,
      grantedAt,
    );
    return saved;
  }

  async createUsers(
    usernames: string[],
    roles: Role[],
    requesterRoles: Role[],
    grantedBy: string,
  ): Promise<UserDocument[]> {
    assertIsAnomalyAdmin(requesterRoles, 'assign');
    const normalizedUsernames = usernames.map((username) => username.trim());
    const existing = await this.userModel
      .find({ username: { $in: normalizedUsernames } }, { username: 1 })
      .exec();
    const existingUsernames = new Set(existing.map((user) => user.username));
    const newUsernames = normalizedUsernames.filter(
      (username) => !existingUsernames.has(username),
    );

    if (newUsernames.length === 0) return [];

    const grantedAt = new Date();
    const roleEntries: UserRoleEntry[] = roles.map((role) => ({ role, grantedBy, grantedAt }));
    const users = await this.userModel.insertMany(
      newUsernames.map((username) => ({ username, roles: roleEntries })),
    );

    await Promise.all(
      newUsernames.map((username) =>
        this.recordRoleSubmissions(
          username,
          roles,
          RoleSubmissionStatus.APPROVED,
          grantedBy,
          grantedAt,
        ),
      ),
    );

    return users;
  }

  /**
   * Internal-only: adds roles to a user, creating the document if needed.
   * No permission check — callers are responsible for validating access before calling this.
   *
   * If a role already exists on the user it is replaced (updated grantedBy/grantedAt).
   * This keeps the roles array free of duplicates while remaining idempotent on retry.
   *
   * Used by:
   *  - assignRole (admin API) — after assertIsAnomalyAdmin passes.
   *  - RoleSubmissionsService.approve — after the approval guard passes.
   */
  async upsertUserWithRoles(
    username: string,
    rolesToAdd: { role: Role; grantedBy: string }[],
    recordApprovedSubmissions = true,
  ): Promise<UserDocument> {
    const grantedAt = new Date();
    const incomingRoleNames = rolesToAdd.map((r) => r.role);

    // Upsert the doc (create if missing), then update in application code to
    // avoid $addToSet object-equality issues with the new subdocument shape.
    let doc = await this.userModel.findOneAndUpdate(
      { username },
      {},
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).exec();

    // Silent cleanup: ANOMALY_ADMIN supersedes all; FLOW_ADMIN supersedes same-flow FLOW_USER.
    let baseRoles: typeof doc.roles;
    if (incomingRoleNames.some((r) => isAnomalyAdmin(r))) {
      baseRoles = [];
    } else {
      const newAdminFlows = incomingRoleNames
        .filter((r) => isAdminRole(r) && !isAnomalyAdmin(r))
        .map(getFlowFromRole)
        .filter((f): f is string => f !== null);

      baseRoles = doc!.roles.filter((entry) => {
        if (incomingRoleNames.includes(entry.role)) return false;
        const flow = getFlowFromRole(entry.role);
        return !(flow && newAdminFlows.includes(flow) && entry.role.endsWith('_USER'));
      });
    }

    // Merge: existing (cleaned) roles + incoming new grants.
    doc!.roles = [
      ...baseRoles,
      ...rolesToAdd.map(({ role, grantedBy }) => ({ role, grantedBy, grantedAt })),
    ];
    doc!.markModified('roles');
    const saved = await doc!.save();

    if (recordApprovedSubmissions) {
      await this.recordRoleSubmissions(
        username,
        rolesToAdd.map(({ role }) => role),
        RoleSubmissionStatus.APPROVED,
        rolesToAdd[0]?.grantedBy ?? 'system',
        grantedAt,
      );
    }

    return saved;
  }

  /**
   * Admin API: assign a single role to a user.
   * Validates that the requester is ANOMALY_ADMIN, then delegates to upsertUserWithRoles.
   */
  async assignRole(
    targetUsername: string,
    roleToAssign: Role,
    requesterRoles: Role[],
    requesterUsername: string,
  ): Promise<UserDocument> {
    assertIsAnomalyAdmin(requesterRoles, 'assign');
    return this.upsertUserWithRoles(targetUsername, [{ role: roleToAssign, grantedBy: requesterUsername }]);
  }

  /**
   * Remove a single role from a user.
   *
   * Same service-level security rules as assignRole.
   */
  async removeRole(
    targetUsername: string,
    roleToRemove: Role,
    requesterRoles: Role[],
    requesterUsername: string,
  ): Promise<UserDocument> {
    assertIsAnomalyAdmin(requesterRoles, 'remove');
    const target = await this.findByUsername(targetUsername);
    const hadRole = target.roles.some((r) => r.role === roleToRemove);
    target.roles = target.roles.filter((r) => r.role !== roleToRemove);
    target.markModified('roles');
    const saved = await target.save();

    if (hadRole) {
      await this.recordRoleSubmissions(
        targetUsername,
        [roleToRemove],
        RoleSubmissionStatus.DELETED,
        requesterUsername,
        new Date(),
      );
    }

    return saved;
  }

  private getRolesInAdminScope(requesterRoles: Role[]): Role[] {
    return requesterRoles
      .filter((role) => isAdminRole(role) && !isAnomalyAdmin(role))
      .flatMap((role) => {
        const flow = getFlowFromRole(role);
        return flow ? getRolesForFlow(flow) : [];
      });
  }

  private async recordRoleSubmissions(
    username: string,
    roles: Role[],
    status: RoleSubmissionStatus.APPROVED | RoleSubmissionStatus.DELETED,
    grantedBy: string,
    grantedAt: Date,
  ): Promise<void> {
    if (roles.length === 0) return;

    await this.roleSubmissionModel.insertMany(
      roles.map((role) => ({
        username,
        role,
        status,
        grantedBy,
        grantedAt,
      })),
    );
  }
}
