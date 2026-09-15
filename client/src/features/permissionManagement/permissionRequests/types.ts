import type { Roles } from '../shared/types'

export enum RoleSubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
export enum RoleSubmissionAction {
  ADDITION = 'ADDITION',
  DELETION = 'DELETION',
}

export const ALL_STATUSES = Object.values(RoleSubmissionStatus)

export const STATUS_LABELS: Record<RoleSubmissionStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

export const ACTION_LABELS: Record<RoleSubmissionAction, string> = {
  [RoleSubmissionAction.ADDITION]: 'Add',
  [RoleSubmissionAction.DELETION]: 'Delete',
}

export interface RoleSubmission {
  _id: string
  username: string
  role: Roles
  action?: RoleSubmissionAction
  status: RoleSubmissionStatus
  grantedBy?: string | null
  grantedAt?: string | null
  createdAt: string
  updatedAt: string
}
