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

  /** Return all users (up to 20). */
  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().limit(20).exec();
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
   * Create or update a user — upsert pattern used by permission approval.
   * Atomically adds roles (no duplicates via $addToSet).
   * Creates the user document if it does not exist yet.
   *
   * Intentionally skips requesterRoles validation — this is a trusted internal
   * call made only after permission approval has already been verified.
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
