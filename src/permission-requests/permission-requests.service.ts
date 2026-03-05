import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PermissionRequest,
  PermissionRequestDocument,
  OverallRequestStatus,
  RoleRequestItem,
  RoleRequestStatus,
} from './schemas/permission-request.schema';
import { CreatePermissionRequestDto } from './dto/create-permission-request.dto';
import { ReviewRolesDto } from './dto/review-roles.dto';
import { UsersService } from '../users/users.service';
import {
  Role,
  hasAnomalyAdmin,
  isAnomalyAdmin,
  isAdminRole,
  canAdminManageRole,
  assertAdminCanManageRoles,
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

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  /**
   * Return all permission requests with computed overall status.
   * ANOMALY_ADMIN sees all; FLOW_ADMIN sees requests containing their flow's roles.
   */
  async findAll(
    requesterRoles: Role[],
  ): Promise<Array<PermissionRequestDocument & { overallStatus: OverallRequestStatus }>> {
    const all = await this.permissionRequestModel.find().exec();

    const filtered = hasAnomalyAdmin(requesterRoles)
      ? all
      : all.filter((req) =>
          req.roles.some((item) =>
            requesterRoles.some(
              (rr) =>
                isAdminRole(rr) &&
                !isAnomalyAdmin(rr) &&
                canAdminManageRole(rr, item.role),
            ),
          ),
        );

    return filtered.map((req) => this.withOverallStatus(req));
  }

  /** Return only requests that still have at least one PENDING role. */
  async findPending(
    requesterRoles: Role[],
  ): Promise<Array<PermissionRequestDocument & { overallStatus: OverallRequestStatus }>> {
    const all = await this.findAll(requesterRoles);
    return all.filter((req) => req.overallStatus !== OverallRequestStatus.APPROVED && req.overallStatus !== OverallRequestStatus.REJECTED);
  }

  /**
   * Return all requests for a given username.
   *
   * Access rules (service-level):
   *  - Any user can fetch their OWN requests (requesterUsername === targetUsername).
   *  - ANOMALY_ADMIN can fetch requests for any username.
   *  - FLOW_ADMIN can fetch requests for any username (useful for pre-approval filtering).
   *  - Regular users (no admin role) can only fetch their own.
   */
  async findByUsername(
    targetUsername: string,
    requesterUsername: string,
    requesterRoles: Role[],
  ): Promise<Array<PermissionRequestDocument & { overallStatus: OverallRequestStatus }>> {
    const isSelf = requesterUsername === targetUsername;
    const isAdmin = hasAnomalyAdmin(requesterRoles) || requesterRoles.some(isAdminRole);

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException(
        'You can only view your own permission requests',
      );
    }

    const requests = await this.permissionRequestModel
      .find({ username: targetUsername })
      .exec();

    return requests.map((req) => this.withOverallStatus(req));
  }

  /** Get a single permission request by ID. */
  async findById(id: string): Promise<PermissionRequestDocument> {
    const req = await this.permissionRequestModel.findById(id).exec();
    if (!req) throw new NotFoundException(`Permission request ${id} not found`);
    return req;
  }

  // ---------------------------------------------------------------------------
  // Approve
  // ---------------------------------------------------------------------------

  /**
   * Approve specific roles within a permission request.
   *
   * Service-level security:
   *  - ANOMALY_ADMIN can approve any roles.
   *  - FLOW_ADMIN can only approve roles within their own flow.
   *
   * On approval:
   *  - Updates RoleRequestItem.status to 'APPROVED' for matching roles.
   *  - Calls UsersService.upsertUserWithRoles — creates user doc if needed.
   */
  async approveRoles(
    requestId: string,
    dto: ReviewRolesDto,
    reviewerUsername: string,
    reviewerRoles: Role[],
  ): Promise<PermissionRequestDocument & { overallStatus: OverallRequestStatus }> {
    const request = await this.findById(requestId);

    assertAdminCanManageRoles(reviewerRoles, dto.roles, 'approve');

    let approvedRoles: Role[] = [];

    request.roles = request.roles.map((item) => {
      if (dto.roles.includes(item.role) && item.status === RoleRequestStatus.PENDING) {
        approvedRoles.push(item.role);
        return { ...item, status: RoleRequestStatus.APPROVED };
      }
      return item;
    });

    request.reviewedBy = reviewerUsername;
    request.reviewedAt = new Date();

    await request.save();

    // Add approved roles to the user (creates user doc if first approval)
    if (approvedRoles.length > 0) {
      await this.usersService.upsertUserWithRoles(request.username, approvedRoles);
    }

    return this.withOverallStatus(request);
  }

  // ---------------------------------------------------------------------------
  // Reject
  // ---------------------------------------------------------------------------

  /**
   * Reject specific roles within a permission request.
   * Same scope rules as approve — FLOW_ADMIN only acts within their flow.
   */
  async rejectRoles(
    requestId: string,
    dto: ReviewRolesDto,
    reviewerUsername: string,
    reviewerRoles: Role[],
  ): Promise<PermissionRequestDocument & { overallStatus: OverallRequestStatus }> {
    const request = await this.findById(requestId);

    assertAdminCanManageRoles(reviewerRoles, dto.roles, 'reject');

    request.roles = request.roles.map((item) => {
      if (dto.roles.includes(item.role) && item.status === RoleRequestStatus.PENDING) {
        return { ...item, status: RoleRequestStatus.REJECTED };
      }
      return item;
    });

    request.reviewedBy = reviewerUsername;
    request.reviewedAt = new Date();

    await request.save();
    return this.withOverallStatus(request);
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  /**
   * Computes the overall status of a request from its individual role statuses.
   *
   * - All PENDING              → PENDING
   * - All APPROVED             → APPROVED
   * - All REJECTED             → REJECTED
   * - Mix of APPROVED/REJECTED → PARTIALLY_APPROVED
   */
  private computeOverallStatus(roles: RoleRequestItem[]): OverallRequestStatus {
    const statuses = roles.map((r) => r.status);
    const allApproved = statuses.every((s) => s === RoleRequestStatus.APPROVED);
    const allRejected = statuses.every((s) => s === RoleRequestStatus.REJECTED);
    const anyPending = statuses.some((s) => s === RoleRequestStatus.PENDING);

    if (allApproved) return OverallRequestStatus.APPROVED;
    if (allRejected) return OverallRequestStatus.REJECTED;
    if (anyPending) return OverallRequestStatus.PENDING;
    return OverallRequestStatus.PARTIALLY_APPROVED;
  }

  private withOverallStatus(
    req: PermissionRequestDocument,
  ): Record<string, any> {
    return {
      ...req.toObject(),
      overallStatus: this.computeOverallStatus(req.roles),
    };
  }

}
