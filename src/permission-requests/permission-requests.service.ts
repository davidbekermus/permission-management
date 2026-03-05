import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PermissionRequest,
  PermissionRequestDocument,
} from './schemas/permission-request.schema';
import {
  OverallRequestStatus,
  RoleRequestItem,
  RoleRequestStatus,
} from './types/permission-request.types';
import { CreatePermissionRequestDto } from './dto/create-permission-request.dto';
import { ReviewRolesDto } from './dto/review-roles.dto';
import { UsersService } from '../users/users.service';
import { computeOverallStatus, withOverallStatus } from './utils/permission-request.utils';
import {
  Role,
  isAdminRole,
  assertAdminCanManageRoles,
  getFlowFromRole,
  getRolesForFlow,
} from '../common/utils/roles.util';

@Injectable()
export class PermissionRequestsService {
  constructor(
    @InjectModel(PermissionRequest.name)
    private readonly permissionRequestModel: Model<PermissionRequestDocument>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Submit a new permission request.
   * Any authenticated user (even with zero roles) can do this.
   * Each requested role starts with PENDING status.
   */
  async create(
    username: string,
    dto: CreatePermissionRequestDto,
  ): Promise<PermissionRequestDocument> {
    const existingOpen = await this.permissionRequestModel.findOne({
      username,
      roles: { $elemMatch: { status: RoleRequestStatus.PENDING } },
    }).exec();

    if (existingOpen) {
      throw new ConflictException(
        'You already have an open request. Add roles to it or remove unwanted ones before creating a new one.',
      );
    }

    const roleItems: RoleRequestItem[] = dto.roles.map((role) => ({
      role,
      status: RoleRequestStatus.PENDING,
    }));

    const request = new this.permissionRequestModel({
      username,
      roles: roleItems,
      requestedAt: new Date(),
    });

    return request.save();
  }

  /**
   * Add new roles to an existing permission request.
   * Only the request owner can call this.
   */
  async addRolesToRequest(
    requestId: string,
    username: string,
    dto: CreatePermissionRequestDto,
  ): Promise<PermissionRequestDocument> {
    const request = await this.fetchDocument(requestId);

    if (request.username !== username) {
      throw new ForbiddenException('You can only modify your own permission requests');
    }

    const existingRoles = new Set(request.roles.map((r) => r.role));
    const newRoles = dto.roles.filter((r) => !existingRoles.has(r));

    if (newRoles.length === 0) {
      return request;
    }

    const newItems: RoleRequestItem[] = newRoles.map((role) => ({
      role,
      status: RoleRequestStatus.PENDING,
    }));

    request.roles = [...request.roles, ...newItems];
    request.markModified('roles');
    return request.save();
  }

  /**
   * Remove pending roles from an existing permission request.
   * Only the request owner can call this.
   * Only PENDING roles can be removed — already reviewed roles are ignored.
   * If no roles remain after removal, the request document is deleted.
   */
  async removeRolesFromRequest(
    requestId: string,
    username: string,
    dto: ReviewRolesDto,
  ): Promise<PermissionRequestDocument | null> {
    const request = await this.fetchDocument(requestId);

    if (request.username !== username) {
      throw new ForbiddenException('You can only modify your own permission requests');
    }

    const toRemove = new Set(dto.roles);
    request.roles = request.roles.filter(
      (item) => !(toRemove.has(item.role) && item.status === RoleRequestStatus.PENDING),
    );

    if (request.roles.length === 0) {
      await this.permissionRequestModel.deleteOne({ _id: request._id }).exec();
      return null;
    }

    request.markModified('roles');
    return request.save();
  }

  /**
   * Return permission requests visible to the requester, with optional filters.
   *
   * Access:
   *  - ANOMALY_ADMIN sees all requests.
   *  - FLOW_ADMIN sees only requests containing their flow's roles (MongoDB-level filter).
   *
   * Filters (all optional):
   *  - username: partial case-insensitive regex match (live search).
   *  - status: exact match on computed overallStatus (applied in JS after fetch).
   *
   * limit set to 20
   */
  async findAll(
    requesterRoles: Role[],
    status?: OverallRequestStatus,
    username?: string,
  ): Promise<Array<PermissionRequestDocument & { overallStatus: OverallRequestStatus }>> {
    const usernameFilter = username
      ? { username: { $regex: username, $options: 'i' } }
      : {};

    let docs: PermissionRequestDocument[];

    if (requesterRoles.includes(Role.ANOMALY_ADMIN)) {
      docs = await this.permissionRequestModel.find(usernameFilter).limit(20).exec();
    } else {
      const adminRoles = requesterRoles.filter(isAdminRole);
      if (adminRoles.length === 0) return [];

      const flowRoles = adminRoles.flatMap((r) => {
        const flow = getFlowFromRole(r);
        return flow ? getRolesForFlow(flow) : [];
      });
      docs = await this.permissionRequestModel
        .find({ 'roles.role': { $in: flowRoles }, ...usernameFilter })
        .limit(20)
        .exec();
    }

    const withStatus = docs.map(withOverallStatus);
    return status ? withStatus.filter((req) => req.overallStatus === status) : withStatus;
  }

  /**
   * Return all requests belonging to the requester themselves.
   * Admins use findAll with ?username= instead of this endpoint.
   */
  async findMine(
    requesterUsername: string,
  ): Promise<Array<PermissionRequestDocument & { overallStatus: OverallRequestStatus }>> {
    const requests = await this.permissionRequestModel
      .find({ username: requesterUsername })
      .limit(20)
      .exec();

    return requests.map(withOverallStatus);
  }

  /** Get a single permission request by ID, including computed overallStatus. */
  async findById(
    id: string,
  ): Promise<PermissionRequestDocument & { overallStatus: OverallRequestStatus }> {
    return withOverallStatus(await this.fetchDocument(id));
  }

  /**
   * Approve one or more roles within a permission request.
   * Body: { roles: ["STORE_USER", "STORE_ADMIN"] } — all roles approved in one call.
   */
  async approveRoles(
    requestId: string,
    dto: ReviewRolesDto,
    reviewerUsername: string,
    reviewerRoles: Role[],
  ): Promise<PermissionRequestDocument & { overallStatus: OverallRequestStatus }> {
    return this.reviewRoles(requestId, dto, reviewerUsername, reviewerRoles, RoleRequestStatus.APPROVED);
  }

  /**
   * Reject one or more roles within a permission request.
   * Same scope rules as approveRoles — FLOW_ADMIN only acts within their flow.
   */
  async rejectRoles(
    requestId: string,
    dto: ReviewRolesDto,
    reviewerUsername: string,
    reviewerRoles: Role[],
  ): Promise<PermissionRequestDocument & { overallStatus: OverallRequestStatus }> {
    return this.reviewRoles(requestId, dto, reviewerUsername, reviewerRoles, RoleRequestStatus.REJECTED);
  }
  /**
   * Core approve/reject logic — shared by approveRoles and rejectRoles.
   *
   * Handles any number of roles in a single call (multi-role approval/rejection).
   * Only PENDING roles matching dto.roles are affected; others are left unchanged.
   *
   * Order of operations (for safe retry on failure):
   *  1. Upsert user roles first (approve path) — atomic and idempotent ($addToSet).
   *  2. Save the request. If this fails, the admin can retry — the upsert won't
   *     add duplicate roles.
   */
  private async reviewRoles(
    requestId: string,
    dto: ReviewRolesDto,
    reviewerUsername: string,
    reviewerRoles: Role[],
    targetStatus: RoleRequestStatus.APPROVED | RoleRequestStatus.REJECTED,
  ): Promise<PermissionRequestDocument & { overallStatus: OverallRequestStatus }> {
    const request = await this.fetchDocument(requestId);

    assertAdminCanManageRoles(reviewerRoles, dto.roles, targetStatus.toLowerCase());

    const affectedRoles: Role[] = [];
    request.roles = request.roles.map((item) => {
      if (dto.roles.includes(item.role) && item.status === RoleRequestStatus.PENDING) {
        affectedRoles.push(item.role);
        return { ...item, status: targetStatus };
      }
      return item;
    });

    request.reviewedBy = reviewerUsername;
    request.reviewedAt = new Date();

    if (targetStatus === RoleRequestStatus.APPROVED && affectedRoles.length > 0) {
      await this.usersService.upsertUserWithRoles(request.username, affectedRoles);
    }

    request.markModified('roles');
    await request.save();
    return withOverallStatus(request);
  }

  /** Fetch the raw Mongoose document by ID. Used internally so callers can mutate and .save(). */
  private async fetchDocument(id: string): Promise<PermissionRequestDocument> {
    const req = await this.permissionRequestModel.findById(id).exec();
    if (!req) throw new NotFoundException(`Permission request ${id} not found`);
    return req;
  }
}
