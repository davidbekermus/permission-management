import type { Role } from '@/features/auth/types'

export type RoleRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type OverallStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_APPROVED'

export interface RoleEntry {
  role: Role
  status: RoleRequestStatus
}

export interface PermissionRequest {
  _id: string
  username: string
  roles: RoleEntry[]
  overallStatus: OverallStatus
  requestedAt: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}
