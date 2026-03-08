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
  
  /** Return all users (up to 20). */
  async findAll(): Promise<UserDocument[]> {
    const limit = 20;
    return this.userModel.find().limit(limit).exec();
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
   * Pass requesterRoles to enforce flow-scope validation (admin API path).
   * Omit requesterRoles for trusted internal calls (seed, permission approval).
   */
  async createUser(
    username: string,
    roles: Role[],
    requesterRoles?: Role[],
  ): Promise<UserDocument> {
    if (requesterRoles) {
      assertAdminCanManageRoles(requesterRoles, roles, 'assign');
    }
    const existing = await this.userModel.findOne({ username }).exec();
    if (existing) {
      throw new ConflictException(`User "${username}" already exists`);
    }
    const user = new this.userModel({ username, roles });
    return user.save();
  }

  /**
   * Internal-only: atomically adds roles to a user, creating the document if needed.
   * No permission check — callers are responsible for validating access before calling this.
   *
   * Used by:
   *  - assignRole (admin API) — after assertAdminCanManageRoles passes.
   *  - PermissionRequestsService.approveRoles — after the approval guard passes.
   */
  async upsertUserWithRoles(
    username: string,
    rolesToAdd: Role[],
  ): Promise<UserDocument> {
    const doc = await this.userModel.findOneAndUpdate(
      { username },
      { $addToSet: { roles: { $each: rolesToAdd } } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).exec();
    return doc!;
  }

  /**
   * Admin API: assign a single role to a user.
   * Validates that the requester has permission to manage the target role,
   * then delegates to upsertUserWithRoles..
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
