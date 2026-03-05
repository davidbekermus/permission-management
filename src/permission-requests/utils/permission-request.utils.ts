import { PermissionRequestDocument } from '../schemas/permission-request.schema';
import {
  OverallRequestStatus,
  RoleRequestItem,
  RoleRequestStatus,
} from '../types/permission-request.types';

/**
 * Computes the overall status of a request from its individual role statuses.
 *
 * - All PENDING    → PENDING
 * - All APPROVED   → APPROVED
 * - All REJECTED   → REJECTED
 * - Any mix        → PARTIALLY_APPROVED
 */
export function computeOverallStatus(roles: RoleRequestItem[]): OverallRequestStatus {
  const unique = new Set(roles.map((r) => r.status));
  if (unique.size !== 1) return OverallRequestStatus.PARTIALLY_APPROVED;
  const [only] = unique;
  if (only === RoleRequestStatus.APPROVED) return OverallRequestStatus.APPROVED;
  if (only === RoleRequestStatus.REJECTED) return OverallRequestStatus.REJECTED;
  return OverallRequestStatus.PENDING;
}

/** Attaches the computed overallStatus to a plain object derived from the document. */
export function withOverallStatus(
  req: PermissionRequestDocument,
): PermissionRequestDocument & { overallStatus: OverallRequestStatus } {
  return {
    ...req.toObject(),
    overallStatus: computeOverallStatus(req.roles),
  } as PermissionRequestDocument & { overallStatus: OverallRequestStatus };
}
