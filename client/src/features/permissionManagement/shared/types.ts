// Shared types and constants used across both the users/ and permissionRequests/ directories.
// Centralised here to avoid cross-directory imports between sibling features.

import type { RoleSubmissionStatus } from '../permissionRequests/types'

// Controls table sort direction. Maps to asc/desc on the server.
export type SortOrder = 'latest' | 'oldest'

// Drives the status chip list in RoleSubmissionsFilterDialog.
export const ALL_STATUSES: RoleSubmissionStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED']

// Human-readable labels for each status value.
export const STATUS_LABELS: Record<RoleSubmissionStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DELETED: 'Deleted',
}
