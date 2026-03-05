import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Role, assertAdminCanManageRoles } from '../common/utils/roles.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /** Find a user by username — throws NotFoundException if not found. */
  async findByUsername(username: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ username }).exec();
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
    const existing = await this.userModel.findOne({ username }).exec();
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
    const existing = await this.userModel.findOne({ username }).exec();

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
    assertAdminCanManageRoles(requesterRoles, [roleToAssign], 'assign');
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
    assertAdminCanManageRoles(requesterRoles, [roleToRemove], 'remove');
    const target = await this.findByUsername(targetUsername);
    target.roles = target.roles.filter((r) => r !== roleToRemove);
    return target.save();
  }
}
