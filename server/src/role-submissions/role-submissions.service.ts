import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { RoleSubmissionDocument } from './schemas/role-submission.schema';
import {
  RoleSubmissionAction,
  RoleSubmissionStatus,
} from './types/role-submission.types';
import { CreateRoleSubmissionDto } from './dto/create-role-submission.dto';
import { UsersRepository } from '../users/users.repository';
import { RoleSubmissionsRepository } from './role-submissions.repository';
import { AdminService } from '../admin/admin.service';
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
    private readonly submissionsRepository: RoleSubmissionsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly adminService: AdminService,
  ) {}

  async create(
    username: string,
    dto: CreateRoleSubmissionDto,
  ): Promise<RoleSubmissionDocument[]> {
    if (dto.action === RoleSubmissionAction.DELETION) {
      const user = await this.usersRepository.findByUsername(username);
      if (!user) throw new NotFoundException(`User "${username}" not found`);
      const heldRoles = user.roles.map((entry) => entry.role);
      const rolesNotHeld = dto.roles.filter((role) => !heldRoles.includes(role));
      if (rolesNotHeld.length > 0) {
        throw new BadRequestException('Deletion requests may only include roles currently held by the user');
      }
    }

    return this.submissionsRepository.createMany({
      username,
      roles: dto.roles,
      action: dto.action,
      status: RoleSubmissionStatus.PENDING,
    });
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
      return this.submissionsRepository.find(
        { ...usernameFilter, ...rolesFilter, ...statusFilter },
        sortOrder,
      );
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

    return this.submissionsRepository.find(
      { role: { $in: effectiveRoles }, ...usernameFilter, ...statusFilter },
      sortOrder,
    );
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

    return this.submissionsRepository.find(
      { username: requesterUsername, ...rolesFilter, ...statusFilter },
      sortOrder,
    );
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
    return this.adminService.approveSubmission(
      submissionId,
      reviewerUsername,
      reviewerRoles,
    );
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
    return this.submissionsRepository.save(submission);
  }

  async deleteMine(submissionId: string, requesterUsername: string): Promise<void> {
    const submission = await this.fetchOwnedPendingDocument(submissionId, requesterUsername);
    await this.submissionsRepository.delete(submission);
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
    const submission = await this.submissionsRepository.findById(id);
    if (!submission) throw new NotFoundException(`Role submission ${id} not found`);
    return submission;
  }
}
