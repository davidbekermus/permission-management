import { canReadPermissionManagement } from '@/app/auth/auth.utils'
import { UsersView } from './users/UsersView'
import { PermissionRequestsView } from './permissionRequests/PermissionRequestsView'
import type { PermissionManagementView } from './PermissionManagementLayout'

interface PermissionManagementPageProps {
  view: PermissionManagementView
  onViewChange: (view: PermissionManagementView) => void
}

export function PermissionManagementPage({ view, onViewChange }: PermissionManagementPageProps) {
  const isAdmin = canReadPermissionManagement()
  // Only admins can view users; flow admins see users in their own flow.
  const activeView: PermissionManagementView = isAdmin ? view : 'submissions'

  return activeView === 'users'
    ? <UsersView onViewChange={onViewChange} />
    : <PermissionRequestsView onViewChange={onViewChange} />
}
