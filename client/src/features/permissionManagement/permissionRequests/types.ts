import type { Role } from '@/features/auth/types'

// Per-role status within a single request (each requested role is reviewed individually)
export type RoleRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// Derived from the individual role statuses:
// APPROVED = all roles approved, REJECTED = all rejected,
// PARTIALLY_APPROVED = mixed, PENDING = none reviewed yet
export type OverallStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_APPROVED'

// One entry per role in the request — tracks review state per role
export interface RoleEntry {
  role: Role
  status: RoleRequestStatus
  reviewedBy?: string  // username of the admin who reviewed
  reviewedAt?: string
}

export interface PermissionRequest {
  _id: string
  username: string
  roles: RoleEntry[]          // each requested role has its own status
  overallStatus: OverallStatus
  requestedAt: string
  createdAt: string
  updatedAt: string
}
