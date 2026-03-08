import type { Role } from '@/features/auth/types'

export interface User {
  _id: string
  username: string
  roles: Role[]
  createdAt: string
  updatedAt: string
}
