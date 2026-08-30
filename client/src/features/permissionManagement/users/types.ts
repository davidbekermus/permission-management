import type { Roles } from '../shared/types'

// Tracks who granted each role and when (audit trail)
export interface UserRoleEntry {
  role: Roles
  grantedBy: string  // username of the admin who assigned it
  grantedAt: string
}

export interface User {
  _id: string
  username: string
  roles: UserRoleEntry[]
  createdAt: string
  updatedAt: string
}
