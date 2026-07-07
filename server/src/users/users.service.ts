import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRoleEntry } from './schemas/user.schema';
import { Role, assertIsAnomalyAdmin, isAdminRole, isAnomalyAdmin, getFlowFromRole } from '../common/utils/roles.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /** Return all users (up to 20), optionally filtered by username, roles, and sorted by date. */
  async findAll(username?: string, roles?: Role[], sort?: 'asc' | 'desc'): Promise<UserDocument[]> {
    const filter: Record<string, unknown> = {};
    if (username) filter.username = { $regex: username, $options: 'i' };
    if (roles?.length) filter['roles.role'] = { $in: roles };
    const sortOrder = sort === 'asc' ? 1 : -1;
    return this.userModel.find(filter).sort({ createdAt: sortOrder }).limit(20).exec();
  }

  /** Find a user by username — throws NotFoundException if not found. */
  async findByUsername(username: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) throw new NotFoundException(`User "${username}" not found`);
    
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
    return user.save();
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
   *  - PermissionRequestsService.approveRoles — after the approval guard passes.
   */
  async upsertUserWithRoles(
    username: string,
    rolesToAdd: { role: Role; grantedBy: string }[],
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
    return doc!.save();
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
  ): Promise<UserDocument> {
    assertIsAnomalyAdmin(requesterRoles, 'remove');
    const target = await this.findByUsername(targetUsername);
    target.roles = target.roles.filter((r) => r.role !== roleToRemove);
    target.markModified('roles');
    return target.save();
  }
}
