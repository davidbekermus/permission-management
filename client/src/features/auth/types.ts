import type { Role } from '@/features/permissionManagement/shared/roles.types'

export interface JwtPayload {
  sub: string
  username: string
  roles: Role[]
  iat: number
  exp: number
}

export interface LoginResponse {
  access_token: string
}
