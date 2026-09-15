import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleSubmissionsRepository } from '../role-submissions/role-submissions.repository';
import {
  RoleSubmissionAction,
  RoleSubmissionStatus,
} from '../role-submissions/types/role-submission.types';
import { isReviewableStatus } from '../role-submissions/utils/role-submission.utils';
import {
  Role,
  assertIsAnomalyAdmin,
  getFlowFromRole,
  isAdminRole,
  isAnomalyAdmin,
} from '../common/utils/roles.util';
import { UserDocument, UserRoleEntry } from '../users/schemas/user.schema';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly submissionsRepository: RoleSubmissionsRepository,
  ) {}

  async createUser(
    username: string,
    roles: Role[],
    requesterRoles: Role[],
    grantedBy: string,
  ): Promise<UserDocument> {
    assertIsAnomalyAdmin(requesterRoles, 'assign');
    if (await this.usersRepository.findByUsername(username)) {
      throw new ConflictException(`User "${username}" already exists`);
    }

    const grantedAt = new Date();
    const roleEntries = this.toRoleEntries(roles, grantedBy, grantedAt);
    const user = await this.usersRepository.create(username, roleEntries);
    await this.recordApproved(username, roles, RoleSubmissionAction.ADDITION, grantedBy, grantedAt);
    return user;
  }

  /** Trusted bootstrap path; never expose this method from an unguarded controller. */
  createSystemUser(username: string, roles: Role[]): Promise<UserDocument> {
    return this.createUser(
      username,
      roles,
      [Role.ANOMALY_ADMIN],
      'system',
    );
  }

  async createUsers(
    usernames: string[],
    roles: Role[],
    requesterRoles: Role[],
    grantedBy: string,
  ): Promise<UserDocument[]> {
    assertIsAnomalyAdmin(requesterRoles, 'assign');
    const normalized = usernames.map((username) => username.trim());
    const existing = await this.usersRepository.findUsernames(normalized);
    const existingNames = new Set(existing.map((user) => user.username));
    const newNames = normalized.filter((username) => !existingNames.has(username));
    if (newNames.length === 0) return [];

    const grantedAt = new Date();
    const roleEntries = this.toRoleEntries(roles, grantedBy, grantedAt);
    const users = await this.usersRepository.insertMany(
      newNames.map((username) => ({ username, roles: roleEntries })),
    );
    await Promise.all(
      newNames.map((username) =>
        this.recordApproved(username, roles, RoleSubmissionAction.ADDITION, grantedBy, grantedAt),
      ),
    );
    return users;
  }

  async assignRole(
    username: string,
    role: Role,
    requesterRoles: Role[],
    grantedBy: string,
  ): Promise<UserDocument> {
    assertIsAnomalyAdmin(requesterRoles, 'assign');
    return this.upsertRoles(username, [{ role, grantedBy }], true);
  }

  async removeRole(
    username: string,
    role: Role,
    requesterRoles: Role[],
    grantedBy: string,
  ): Promise<UserDocument> {
    assertIsAnomalyAdmin(requesterRoles, 'remove');
    const user = await this.removeRoleFromUser(username, role);
    await this.recordApproved(
      username,
      [role],
      RoleSubmissionAction.DELETION,
      grantedBy,
      new Date(),
    );
    return user;
  }

  async approveSubmission(
    submissionId: string,
    reviewerUsername: string,
    reviewerRoles: Role[],
  ) {
    assertIsAnomalyAdmin(reviewerRoles, 'approve');
    const submission = await this.submissionsRepository.findById(submissionId);
    if (!submission) throw new NotFoundException(`Role submission ${submissionId} not found`);
    if (!isReviewableStatus(submission.status)) {
      throw new ConflictException(`Role submission ${submissionId} is already ${submission.status}`);
    }

    if (submission.action === RoleSubmissionAction.ADDITION) {
      await this.upsertRoles(
        submission.username,
        [{ role: submission.role, grantedBy: reviewerUsername }],
        false,
      );
    } else {
      await this.removeRoleFromUser(submission.username, submission.role);
    }

    submission.status = RoleSubmissionStatus.APPROVED;
    submission.grantedBy = reviewerUsername;
    submission.grantedAt = new Date();
    return this.submissionsRepository.save(submission);
  }

  private async upsertRoles(
    username: string,
    rolesToAdd: { role: Role; grantedBy: string }[],
    recordApproved: boolean,
  ): Promise<UserDocument> {
    const grantedAt = new Date();
    const incoming = rolesToAdd.map(({ role }) => role);
    const user = await this.usersRepository.upsertByUsername(username);

    let baseRoles: UserRoleEntry[];
    if (incoming.some(isAnomalyAdmin)) {
      baseRoles = [];
    } else {
      const newAdminFlows = incoming
        .filter((role) => isAdminRole(role) && !isAnomalyAdmin(role))
        .map(getFlowFromRole)
        .filter((flow): flow is string => flow !== null);
      baseRoles = user!.roles.filter((entry) => {
        if (incoming.includes(entry.role)) return false;
        const flow = getFlowFromRole(entry.role);
        return !(flow && newAdminFlows.includes(flow) && entry.role.endsWith('_USER'));
      });
    }

    user!.roles = [
      ...baseRoles,
      ...this.toRoleEntries(incoming, rolesToAdd[0]?.grantedBy ?? 'system', grantedAt),
    ];
    user!.markModified('roles');
    const saved = await this.usersRepository.save(user!);

    if (recordApproved) {
      await this.recordApproved(
        username,
        incoming,
        RoleSubmissionAction.ADDITION,
        rolesToAdd[0]?.grantedBy ?? 'system',
        grantedAt,
      );
    }
    return saved;
  }

  private async removeRoleFromUser(username: string, role: Role) {
    const user = await this.usersRepository.findByUsername(username);
    if (!user) throw new NotFoundException(`User "${username}" not found`);
    if (!user.roles.some((entry) => entry.role === role)) {
      throw new ConflictException(`User "${username}" does not have role ${role}`);
    }
    user.roles = user.roles.filter((entry) => entry.role !== role);
    user.markModified('roles');
    return this.usersRepository.save(user);
  }

  private toRoleEntries(roles: Role[], grantedBy: string, grantedAt: Date): UserRoleEntry[] {
    return roles.map((role) => ({ role, grantedBy, grantedAt }));
  }

  private async recordApproved(
    username: string,
    roles: Role[],
    action: RoleSubmissionAction,
    grantedBy: string,
    grantedAt: Date,
  ): Promise<void> {
    if (roles.length === 0) return;
    await this.submissionsRepository.createMany({
      username,
      roles,
      action,
      status: RoleSubmissionStatus.APPROVED,
      grantedBy,
      grantedAt,
    });
  }
}
