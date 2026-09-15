import { Role } from '../../common/utils/roles.util';

/** Status of a single role submission. */
export enum RoleSubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum RoleSubmissionAction {
  ADDITION = 'ADDITION',
  DELETION = 'DELETION',
}

export class RoleSubmissionItem {
  username: string;
  role: Role;
  action: RoleSubmissionAction;
  status: RoleSubmissionStatus;
  grantedBy?: string;
  grantedAt?: Date;
}
