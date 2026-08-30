import { Roles } from './types'

export function getFlowFromRole(role: Roles): string | null {
  if (role === Roles.ANOMALY_ADMIN) return null
  const parts = role.split('_')
  return parts.slice(0, -1).join('_')
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
