import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import {
  Role,
  isAnomalyAdmin,
  isAdminRole,
  hasAnomalyAdmin,
  canAdminManageRole,
  getFlowFromRole,
} from '../common/utils/roles.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /** Find a user by username (returns null if not found). */
  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  /** Find a user by username, throw NotFoundException if missing. */
  async findByUsernameOrFail(username: string): Promise<UserDocument> {
    const user = await this.findByUsername(username);
    if (!user) throw new NotFoundException(`User "${username}" not found`);
    return user;
  }

  /** Return all users. */
  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  /**
   * Create a new user with optional initial roles.
   * Used by: AuthService.seedSuperAdmin, PermissionRequestsService (on approval).
   */
  async createUser(username: string, roles: Role[] = []): Promise<UserDocument> {
    const existing = await this.findByUsername(username);
    if (existing) {
      throw new ConflictException(`User "${username}" already exists`);
    }
    const user = new this.userModel({ username, roles });
    return user.save();
  }

  /**
   * Create or update a user — upsert pattern used by permission approval.
   * If user exists, appends the new roles (no duplicates).
   * If user doesn't exist, creates a new user document.
   */
  async upsertUserWithRoles(
    username: string,
    rolesToAdd: Role[],
  ): Promise<UserDocument> {
    const existing = await this.findByUsername(username);

    if (existing) {
      // Merge without duplicates
      const merged = Array.from(new Set([...existing.roles, ...rolesToAdd]));
      existing.roles = merged;
      return existing.save();
    }

    // First-time creation on permission approval
    return this.createUser(username, rolesToAdd);
  }

  /**
   * Assign a single role to a user, creating the user document if needed.
   *
   * Service-level security:
   *  - requesterRoles must contain ANOMALY_ADMIN
   *    OR a FLOW_ADMIN whose flow matches the target role.
   *  - Nobody (except ANOMALY_ADMIN themselves) can assign ANOMALY_ADMIN.
   *
   * Uses upsert — FLOW_ADMIN can assign roles to users who don't exist in DB
   * yet, which creates the user document in the same operation.
   */
  async assignRole(
    targetUsername: string,
    roleToAssign: Role,
    requesterRoles: Role[],
  ): Promise<UserDocument> {
    this.validateRoleMutationPermission(roleToAssign, requesterRoles, 'assign');
    // Upsert: creates the user if not in DB, or appends the role if they are.
    return this.upsertUserWithRoles(targetUsername, [roleToAssign]);
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
    this.validateRoleMutationPermission(roleToRemove, requesterRoles, 'remove');

    const target = await this.findByUsernameOrFail(targetUsername);
    target.roles = target.roles.filter((r) => r !== roleToRemove);
    return target.save();
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  /**
   * Validates that the requester has permission to mutate (assign/remove) a role.
   *
   * Rules (using reusable role utilities — no hardcoded flow names):
   *  1. ANOMALY_ADMIN requesters can do anything.
   *  2. Only ANOMALY_ADMIN can assign/remove ANOMALY_ADMIN.
   *  3. FLOW_ADMIN can only mutate roles within their own flow.
   *  4. FLOW_USER cannot mutate roles at all.
   */
  private validateRoleMutationPermission(
    targetRole: Role,
    requesterRoles: Role[],
    action: 'assign' | 'remove',
  ): void {
    // Rule 1: ANOMALY_ADMIN can do anything
    if (hasAnomalyAdmin(requesterRoles)) return;

    // Rule 2: only ANOMALY_ADMIN can touch the ANOMALY_ADMIN role
    if (isAnomalyAdmin(targetRole)) {
      throw new ForbiddenException(
        'Only ANOMALY_ADMIN can assign or remove the ANOMALY_ADMIN role',
      );
    }

    // Find the first admin role the requester holds in any flow
    const requesterAdminRole = requesterRoles.find(
      (r) => isAdminRole(r) && !isAnomalyAdmin(r),
    );

    if (!requesterAdminRole) {
      throw new ForbiddenException(
        `You must be a FLOW_ADMIN to ${action} roles`,
      );
    }

    // Rule 3: FLOW_ADMIN can only act within their own flow
    if (!canAdminManageRole(requesterAdminRole, targetRole)) {
      const requesterFlow = getFlowFromRole(requesterAdminRole);
      const targetFlow = getFlowFromRole(targetRole);
      throw new ForbiddenException(
        `${requesterFlow}_ADMIN cannot ${action} roles from the ${targetFlow} flow`,
      );
    }
  }
}
