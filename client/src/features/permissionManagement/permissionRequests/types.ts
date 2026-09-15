import type { Roles } from '../shared/types'

export type RoleSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type RoleSubmissionAction = 'ADDITION' | 'DELETION'

export const ALL_STATUSES: RoleSubmissionStatus[] = ['PENDING', 'APPROVED', 'REJECTED']

export const STATUS_LABELS: Record<RoleSubmissionStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

export const ACTION_LABELS: Record<RoleSubmissionAction, string> = {
  ADDITION: 'Add',
  DELETION: 'Delete',
}

export interface RoleSubmission {
  _id: string
  username: string
  role: Roles
  action: RoleSubmissionAction
  status: RoleSubmissionStatus
  grantedBy?: string | null
  grantedAt?: string | null
  createdAt: string
  updatedAt: string
}
