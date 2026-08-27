import { Role } from '../../common/utils/roles.util';

/** Status of a single role submission. */
export enum RoleSubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED',
}

export class RoleSubmissionItem {
  username: string;
  role: Role;
  status: RoleSubmissionStatus;
  grantedBy?: string;
  grantedAt?: Date;
}
