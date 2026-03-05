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

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  /**
   * Submit a new permission request.
   * Any authenticated user (even with zero roles) can do this.
   * Each requested role starts with PENDING status.
   */
  async create(
    username: string,
    dto: CreatePermissionRequestDto,
  ): Promise<PermissionRequestDocument> {
    const conflicting = await this.permissionRequestModel.findOne({
      username,
      'roles': { $elemMatch: { role: { $in: dto.roles }, status: RoleRequestStatus.PENDING } },
    }).exec();

    if (conflicting) {
      throw new ConflictException(
        'A pending request already exists for one or more of these roles',
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
   * Roles already present (in any status) are silently ignored.
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

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

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
   * Returns up to 20 results. When status is set the returned count may be less.
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

    const withStatus = docs.map((req) => this.withOverallStatus(req));
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

    return requests.map((req) => this.withOverallStatus(req));
  }

  /** Get a single permission request by ID, including computed overallStatus. */
  async findById(
    id: string,
  ): Promise<PermissionRequestDocument & { overallStatus: OverallRequestStatus }> {
    return this.withOverallStatus(await this.fetchDocument(id));
  }

  // ---------------------------------------------------------------------------
  // Approve / Reject
  // ---------------------------------------------------------------------------

  /**
   * Approve one or more roles within a permission request.
   * Body: { roles: ["STORE_USER", "STORE_ADMIN"] } — all roles approved in one call.
   *
   * Service-level security:
   *  - ANOMALY_ADMIN can approve any roles.
   *  - FLOW_ADMIN can only approve roles within their own flow.
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

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

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
    return this.withOverallStatus(request);
  }

  /** Fetch the raw Mongoose document by ID. Used internally so callers can mutate and .save(). */
  private async fetchDocument(id: string): Promise<PermissionRequestDocument> {
    const req = await this.permissionRequestModel.findById(id).exec();
    if (!req) throw new NotFoundException(`Permission request ${id} not found`);
    return req;
  }

  /**
   * Computes the overall status of a request from its individual role statuses.
   *
   * - All PENDING              → PENDING
   * - All APPROVED             → APPROVED
   * - All REJECTED             → REJECTED
   * - Mix of any statuses      → PARTIALLY_APPROVED
   *
   * Single pass: if the Set of unique statuses has exactly one entry,
   * all roles share that status. More than one entry means a mix.
   */
  private computeOverallStatus(roles: RoleRequestItem[]): OverallRequestStatus {
    const unique = new Set(roles.map((r) => r.status));
    if (unique.size !== 1) return OverallRequestStatus.PARTIALLY_APPROVED;
    const [only] = unique;
    if (only === RoleRequestStatus.APPROVED) return OverallRequestStatus.APPROVED;
    if (only === RoleRequestStatus.REJECTED)  return OverallRequestStatus.REJECTED;
    return OverallRequestStatus.PENDING;
  }

  private withOverallStatus(
    req: PermissionRequestDocument,
  ): PermissionRequestDocument & { overallStatus: OverallRequestStatus } {
    return {
      ...req.toObject(),
      overallStatus: this.computeOverallStatus(req.roles),
    } as PermissionRequestDocument & { overallStatus: OverallRequestStatus };
  }

}
