import { jwtDecode } from 'jwt-decode'
import { TOKEN_KEY } from '@/app/constants'
import { ALL_ROLES, getFlowFromRole, type JwtPayload, type Role } from '@/features/auth/types'

export function getUserToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setUserToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeUserToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getCurrentUser(): JwtPayload | null {
  const token = getUserToken()
  if (!token) return null

  try {
    const payload = jwtDecode<JwtPayload>(token)
    if (payload.exp * 1000 <= Date.now()) {
      removeUserToken()
      return null
    }
    return payload
  } catch {
    removeUserToken()
    return null
  }
}

export function getCurrentUsername(): string | null {
  return getCurrentUser()?.username ?? null
}

export function getCurrentRoles(): Role[] {
  return getCurrentUser()?.roles ?? []
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

export function isAnomalyAdmin(): boolean {
  return getCurrentRoles().includes('ANOMALY_ADMIN')
}

export function isAdmin(): boolean {
  return getCurrentRoles().some((role) => role.endsWith('_ADMIN'))
}

export function isFlowAdmin(flow: string): boolean {
  const roles = getCurrentRoles()
  return roles.includes('ANOMALY_ADMIN') || roles.includes(`${flow}_ADMIN` as Role)
}

export function canReadPermissionManagement(): boolean {
  return isAdmin()
}

export function canManagePermissions(): boolean {
  return isAnomalyAdmin()
}

export function isRoleInAdminScope(role: Role): boolean {
  if (isAnomalyAdmin()) return true
  const flow = getFlowFromRole(role)
  return flow !== null && isFlowAdmin(flow)
}

export function getRolesInAdminScope(): Role[] {
  return ALL_ROLES.filter(isRoleInAdminScope)
}
