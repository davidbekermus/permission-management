import { useAuth } from '@/app/providers/AuthProvider'
import { getFlowFromRole, type Role } from '@/features/auth/types'

// Shared hook used by UsersTable, PermissionRequestsTable, and AddUserDialog.
// ANOMALY_ADMIN can manage every role; flow admins only manage roles within their flow.
export function useRoleManagement() {
  const { isAnomalyAdmin, isFlowAdmin } = useAuth()

  const canManageRole = (role: Role): boolean => {
    if (isAnomalyAdmin) return true
    const flow = getFlowFromRole(role)
    if (!flow) return false
    return isFlowAdmin(flow)
  }

  return { canManageRole }
}
