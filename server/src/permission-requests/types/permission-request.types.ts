import { Role } from '../../common/utils/roles.util';

/** Status of a single role within a permission request. */
export enum RoleRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/**
 * Compact per-role status tracker.
 * Each requested role has its own lifecycle — allows partial approvals.
 * reviewedBy and reviewedAt are set when an admin acts on the role.
 */
export class RoleRequestItem {
  role: Role;
  status: RoleRequestStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
}

/**
 * Computed overall status of a permission request — derived from role statuses.
 * Not stored in DB; calculated on the fly.
 */
export enum OverallRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PARTIALLY_APPROVED = 'PARTIALLY_APPROVED',
  REJECTED = 'REJECTED',
}
