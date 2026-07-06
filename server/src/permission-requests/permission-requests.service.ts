import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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
  assertIsAnomalyAdmin,
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
   * Submit a permission request (upsert).
   * If the user already has a request document, the new roles are merged into it
   * as PENDING (skipping roles that already exist in any status).
   * If no document exists, a new one is created.
   * Any authenticated user (even with zero roles) can do this.
   */
  async create(
    username: string,
    dto: CreatePermissionRequestDto,
  ): Promise<PermissionRequestDocument & { overallStatus: OverallRequestStatus }> {
    const existing = await this.permissionRequestModel.findOne({ username }).exec();

    if (existing) {
      const existingRoles = new Set(existing.roles.map((r) => r.role));
      const newRoles = dto.roles.filter((r) => !existingRoles.has(r));

      if (newRoles.length > 0) {
        const newItems: RoleRequestItem[] = newRoles.map((role) => ({
          role,
          status: RoleRequestStatus.PENDING,
        }));
        existing.roles = [...existing.roles, ...newItems];
        existing.markModified('roles');
        await existing.save();
      }

      return withOverallStatus(existing);
    }

    const roleItems: RoleRequestItem[] = dto.roles.map((role) => ({
      role,
      status: RoleRequestStatus.PENDING,
    }));

    const saved = await new this.permissionRequestModel({
      username,
      roles: roleItems,
      requestedAt: new Date(),
    }).save();

    return withOverallStatus(saved);
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
    statuses?: OverallRequestStatus[],
    username?: string,
    roles?: Role[],
    sort?: 'asc' | 'desc',
  ): Promise<Array<PermissionRequestDocument & { overallStatus: OverallRequestStatus }>> {
    const usernameFilter = username ? { username: { $regex: username, $options: 'i' } } : {};
    const rolesFilter = roles?.length ? { 'roles.role': { $in: roles } } : {};
    const sortOrder = sort === 'asc' ? 1 : -1;

    let docs: PermissionRequestDocument[];

    if (requesterRoles.includes(Role.ANOMALY_ADMIN)) {
      docs = await this.permissionRequestModel
        .find({ ...usernameFilter, ...rolesFilter })
        .sort({ createdAt: sortOrder })
        .limit(20)
        .exec();
    } else {
      const adminRoles = requesterRoles.filter(isAdminRole);
      if (adminRoles.length === 0) return [];

      const flowRoles = adminRoles.flatMap((r) => {
        const flow = getFlowFromRole(r);
        return flow ? getRolesForFlow(flow) : [];
      });
      docs = await this.permissionRequestModel
        .find({ 'roles.role': { $in: flowRoles }, ...usernameFilter, ...rolesFilter })
        .sort({ createdAt: sortOrder })
        .limit(20)
        .exec();
    }

    const withStatus = docs.map(withOverallStatus);
    return statuses?.length ? withStatus.filter((req) => statuses.includes(req.overallStatus)) : withStatus;
  }

  /**
   * Return all requests belonging to the requester themselves.
   * Admins use findAll with ?username= instead of this endpoint.
   */
  async findMine(
    requesterUsername: string,
    statuses?: OverallRequestStatus[],
    roles?: Role[],
    sort?: 'asc' | 'desc',
  ): Promise<Array<PermissionRequestDocument & { overallStatus: OverallRequestStatus }>> {
    const rolesFilter = roles?.length ? { 'roles.role': { $in: roles } } : {};
    const sortOrder = sort === 'asc' ? 1 : -1;

    const requests = await this.permissionRequestModel
      .find({ username: requesterUsername, ...rolesFilter })
      .sort({ createdAt: sortOrder })
      .limit(20)
      .exec();

    const withStatus = requests.map(withOverallStatus);
    return statuses?.length ? withStatus.filter((req) => statuses.includes(req.overallStatus)) : withStatus;
  }

  /** Get a single permission request by ID, including computed overallStatus. */
  async findById(
    id: string,
  ): Promise<PermissionRequestDocument & { overallStatus: OverallRequestStatus }> {
    return withOverallStatus(await this.fetchDocument(id));
  }

  /**
   * Approve one or more roles within a permission request. ANOMALY_ADMIN only.
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
   * Same scope rules as approveRoles — ANOMALY_ADMIN only.
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

    assertIsAnomalyAdmin(reviewerRoles, targetStatus.toLowerCase());

    const affectedRoles: Role[] = [];
    const reviewedAt = new Date();
    request.roles = request.roles.map((item) => {
      if (!dto.roles.includes(item.role)) return item;
      // Approval overrides both PENDING and REJECTED; rejection only applies to PENDING
      const isEligible =
        targetStatus === RoleRequestStatus.APPROVED
          ? item.status !== RoleRequestStatus.APPROVED
          : item.status === RoleRequestStatus.PENDING;
      if (isEligible) {
        affectedRoles.push(item.role);
        return { ...item, status: targetStatus, reviewedBy: reviewerUsername, reviewedAt };
      }
      return item;
    });

    if (targetStatus === RoleRequestStatus.APPROVED && affectedRoles.length > 0) {
      await this.usersService.upsertUserWithRoles(
        request.username,
        affectedRoles.map((role) => ({ role, grantedBy: reviewerUsername })),
      );
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
