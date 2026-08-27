import type { Role } from '@/features/auth/types'

export type RoleSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELETED'

export interface RoleSubmission {
  _id: string
  username: string
  role: Role
  status: RoleSubmissionStatus
  grantedBy?: string | null
  grantedAt?: string | null
  createdAt: string
  updatedAt: string
}
