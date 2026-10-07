import { Roles } from './types'

// STORE_ADMIN → store-admin
export function formatRole(role: Roles): string {
  return role.toLowerCase().replace(/_/g, '-')
}

export function getFlowFromRole(role: Roles): string | null {
  if (role === Roles.ANOMALY_ADMIN) return null
  const parts = role.split('_')
  return parts.slice(0, -1).join('_')
}

export function normalizeRoles(roles: Roles[]): Roles[] {
  if (roles.includes(Roles.ANOMALY_ADMIN)) return [Roles.ANOMALY_ADMIN]
  return roles.filter((role) => {
    const flow = getFlowFromRole(role)
    return !(flow && role.endsWith('_USER') && roles.includes(`${flow}_ADMIN` as Roles))
  })
}

/**
 * Filters a candidate collection of roles to those that can still be requested
 * or assigned based on the user's existing roles.
 *
 * The candidate roles may be ALL_ROLES or a restricted subset.
 * Excludes:
 *  - Every role when the user has ANOMALY_ADMIN
 *  - Roles the user already has
 *  - FLOW_USER when the user already has FLOW_ADMIN for that flow
 */
export function filterRequestableRoles(candidateRoles: Roles[], existingRoles: Roles[]): Roles[] {
  if (existingRoles.includes(Roles.ANOMALY_ADMIN)) return []
  return candidateRoles.filter((role) => {
    if (existingRoles.includes(role)) return false
    const flow = getFlowFromRole(role)
    if (flow && role.endsWith('_USER') && existingRoles.includes(`${flow}_ADMIN` as Roles)) return false
    return true
  })
}
