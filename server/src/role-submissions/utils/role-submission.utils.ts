import { RoleSubmissionStatus } from '../types/role-submission.types';

export function isReviewableStatus(status: RoleSubmissionStatus): boolean {
  return status === RoleSubmissionStatus.PENDING || status === RoleSubmissionStatus.REJECTED;
}
