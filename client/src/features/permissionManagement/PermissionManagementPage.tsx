import { useNavigate } from '@tanstack/react-router'
import { canReadPermissionManagement } from '@/app/auth/auth.utils'
import { UsersView } from './users/UsersView'
import { PermissionRequestsView } from './permissionRequests/PermissionRequestsView'
import type { PermissionManagementView } from './PermissionManagementLayout'

interface PermissionManagementPageProps {
  view: PermissionManagementView
}

export function PermissionManagementPage({ view }: PermissionManagementPageProps) {
  const isAdmin = canReadPermissionManagement()
  const navigate = useNavigate()
  // only adimns have reading rights to see users with flow admins only seeing users of the own flow
  const activeView: PermissionManagementView = isAdmin ? view : 'submissions'

  const handleViewChange = (nextView: PermissionManagementView) => {
    // this has to be changes when untergrated to the real project
    navigate({
      to: nextView === 'users'
        ? '/app/settings/users'
        : '/app/settings/permission-requests',
    })
  }

  return activeView === 'users'
    ? <UsersView onViewChange={handleViewChange} />
    : <PermissionRequestsView onViewChange={handleViewChange} />
}
