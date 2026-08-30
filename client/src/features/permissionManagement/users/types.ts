import type { Role } from '../shared/roles.types'

// Tracks who granted each role and when (audit trail)
export interface UserRoleEntry {
  role: Role
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
