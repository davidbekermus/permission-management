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

export function getFlowFromRole(role: Role): string | null {
  if (role === 'ANOMALY_ADMIN') return null
  const parts = role.split('_')
  return parts.slice(0, -1).join('_')
}

/**
 * Returns the subset of ALL_ROLES that make sense to request/assign given
 * the roles a user already holds:
 *  - Empty if the user is ANOMALY_ADMIN (everything is redundant)
 *  - Excludes roles the user already has
 *  - Excludes FLOW_USER if the user already has FLOW_ADMIN of the same flow
 */
export function filterRequestableRoles(allRoles: Role[], existingRoles: Role[]): Role[] {
  if (existingRoles.includes('ANOMALY_ADMIN')) return []
  return allRoles.filter((r) => {
    if (existingRoles.includes(r)) return false
    const flow = getFlowFromRole(r)
    if (flow && r.endsWith('_USER') && existingRoles.includes(`${flow}_ADMIN` as Role)) return false
    return true
  })
}

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
