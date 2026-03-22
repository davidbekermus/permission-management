// Shared types and constants used across both the users/ and permissionRequests/ directories.
// Centralised here to avoid cross-directory imports between sibling features.

import type { OverallStatus } from '../permissionRequests/types'

// Controls table sort direction — maps to asc/desc on the server
export type SortOrder = 'latest' | 'oldest'

// Drives the status chip list in RequestsFilterDialog
export const ALL_STATUSES: OverallStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_APPROVED']

// Human-readable labels for each status value
export const STATUS_LABELS: Record<OverallStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PARTIALLY_APPROVED: 'Partial',
}
