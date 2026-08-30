import type { Roles } from '../shared/types'

export type RoleSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELETED'

export const ALL_STATUSES: RoleSubmissionStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED']

export const STATUS_LABELS: Record<RoleSubmissionStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DELETED: 'Deleted',
}

export interface RoleSubmission {
  _id: string
  username: string
  role: Roles
  status: RoleSubmissionStatus
  grantedBy?: string | null
  grantedAt?: string | null
  createdAt: string
  updatedAt: string
}
