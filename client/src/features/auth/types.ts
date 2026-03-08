export type Role =
  | 'ANOMALY_ADMIN'
  | 'STORE_ADMIN'
  | 'STORE_USER'
  | 'PRODUCT_ADMIN'
  | 'PRODUCT_USER'

export const ALL_ROLES: Role[] = [
  'ANOMALY_ADMIN',
  'STORE_ADMIN',
  'STORE_USER',
  'PRODUCT_ADMIN',
  'PRODUCT_USER',
]

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
