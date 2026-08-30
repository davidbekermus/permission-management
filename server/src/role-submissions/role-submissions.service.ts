import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RoleSubmission,
  RoleSubmissionDocument,
} from './schemas/role-submission.schema';
import { RoleSubmissionStatus } from './types/role-submission.types';
import { CreateRoleSubmissionDto } from './dto/create-role-submission.dto';
import { UsersService } from '../users/users.service';
import { isReviewableStatus } from './utils/role-submission.utils';
import {
  Role,
  isAdminRole,
  assertIsAnomalyAdmin,
  getFlowFromRole,
  getRolesForFlow,
} from '../common/utils/roles.util';

@Injectable()
export class RoleSubmissionsService {
  constructor(
    @InjectModel(RoleSubmission.name)
    private readonly roleSubmissionModel: Model<RoleSubmissionDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    username: string,
    dto: CreateRoleSubmissionDto,
  ): Promise<RoleSubmissionDocument[]> {
    const submissions = dto.roles.map((role) => ({
      username,
      role,
      status: RoleSubmissionStatus.PENDING,
    }));

    return this.roleSubmissionModel.insertMany(submissions);
  }

  async findAll(
    requesterRoles: Role[],
    statuses?: RoleSubmissionStatus[],
    username?: string,
    roles?: Role[],
    sort?: 'asc' | 'desc',
  ): Promise<RoleSubmissionDocument[]> {
    const usernameFilter = username ? { username: { $regex: username, $options: 'i' } } : {};
    const rolesFilter = roles?.length ? { role: { $in: roles } } : {};
    const statusFilter = statuses?.length ? { status: { $in: statuses } } : {};
    const sortOrder = sort === 'asc' ? 1 : -1;

    if (requesterRoles.includes(Role.ANOMALY_ADMIN)) {
      return this.roleSubmissionModel
        .find({ ...usernameFilter, ...rolesFilter, ...statusFilter })
        .sort({ createdAt: sortOrder })
        .limit(20)
        .exec();
    }

    const adminRoles = requesterRoles.filter(isAdminRole);
    if (adminRoles.length === 0) return [];

    const flowRoles = adminRoles.flatMap((role) => {
      const flow = getFlowFromRole(role);
      return flow ? getRolesForFlow(flow) : [];
    });

    const effectiveRoles = roles?.length
      ? roles.filter((role) => flowRoles.includes(role))
      : flowRoles;
    if (effectiveRoles.length === 0) return [];

    return this.roleSubmissionModel
      .find({ role: { $in: effectiveRoles }, ...usernameFilter, ...statusFilter })
      .sort({ createdAt: sortOrder })
      .limit(20)
      .exec();
  }

  async findMine(
    requesterUsername: string,
    statuses?: RoleSubmissionStatus[],
    roles?: Role[],
    sort?: 'asc' | 'desc',
  ): Promise<RoleSubmissionDocument[]> {
    const rolesFilter = roles?.length ? { role: { $in: roles } } : {};
    const statusFilter = statuses?.length ? { status: { $in: statuses } } : {};
    const sortOrder = sort === 'asc' ? 1 : -1;

    return this.roleSubmissionModel
      .find({ username: requesterUsername, ...rolesFilter, ...statusFilter })
      .sort({ createdAt: sortOrder })
      .limit(20)
      .exec();
  }

  async findById(id: string, requesterRoles: Role[]): Promise<RoleSubmissionDocument> {
    const submission = await this.fetchDocument(id);
    if (requesterRoles.includes(Role.ANOMALY_ADMIN)) return submission;

    const scopedRoles = requesterRoles
      .filter(isAdminRole)
      .flatMap((role) => {
        const flow = getFlowFromRole(role);
        return flow ? getRolesForFlow(flow) : [];
      });

    if (!scopedRoles.includes(submission.role)) {
      throw new NotFoundException(`Role submission "${id}" not found`);
    }
    return submission;
  }

  async approve(
    submissionId: string,
    reviewerUsername: string,
    reviewerRoles: Role[],
  ): Promise<RoleSubmissionDocument> {
    const submission = await this.fetchDocument(submissionId);
    assertIsAnomalyAdmin(reviewerRoles, 'approve');

    if (!isReviewableStatus(submission.status)) {
      throw new ConflictException(`Role submission ${submissionId} is already ${submission.status}`);
    }

    const grantedAt = new Date();
    await this.usersService.upsertUserWithRoles(
      submission.username,
      [{ role: submission.role, grantedBy: reviewerUsername }],
      false,
    );

    submission.status = RoleSubmissionStatus.APPROVED;
    submission.grantedBy = reviewerUsername;
    submission.grantedAt = grantedAt;
    return submission.save();
  }

  async reject(
    submissionId: string,
    reviewerUsername: string,
    reviewerRoles: Role[],
  ): Promise<RoleSubmissionDocument> {
    const submission = await this.fetchDocument(submissionId);
    assertIsAnomalyAdmin(reviewerRoles, 'reject');

    if (submission.status !== RoleSubmissionStatus.PENDING) {
      throw new ConflictException(`Role submission ${submissionId} is already ${submission.status}`);
    }

    submission.status = RoleSubmissionStatus.REJECTED;
    submission.grantedBy = reviewerUsername;
    submission.grantedAt = new Date();
    return submission.save();
  }

  async deleteMine(submissionId: string, requesterUsername: string): Promise<void> {
    const submission = await this.fetchOwnedPendingDocument(submissionId, requesterUsername);
    await submission.deleteOne();
  }

  private async fetchOwnedPendingDocument(
    submissionId: string,
    requesterUsername: string,
  ): Promise<RoleSubmissionDocument> {
    const submission = await this.fetchDocument(submissionId);
    if (submission.username !== requesterUsername) {
      throw new ForbiddenException('You can only modify your own role submissions');
    }
    if (submission.status !== RoleSubmissionStatus.PENDING) {
      throw new ConflictException('Only pending role submissions can be modified');
    }
    return submission;
  }

  private async fetchDocument(id: string): Promise<RoleSubmissionDocument> {
    const submission = await this.roleSubmissionModel.findById(id).exec();
    if (!submission) throw new NotFoundException(`Role submission ${id} not found`);
    return submission;
  }
}
