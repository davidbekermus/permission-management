import { useState } from 'react'
import { canReadPermissionManagement } from '@/app/auth/auth.utils'
import { UsersView } from './users/UsersView'
import { PermissionRequestsView } from './roleSubmissions/RoleSubmissionsView'
import { PermissionManagementLayout, type PermissionManagementView } from './PermissionManagementLayout'

interface PermissionManagementPageProps {
  view: PermissionManagementView
  onViewChange: (view: PermissionManagementView) => void
}

export function PermissionManagementPage({ view, onViewChange }: PermissionManagementPageProps) {
  const [toolbarContainer, setToolbarContainer] = useState<HTMLDivElement | null>(null)
  const isAdmin = canReadPermissionManagement()
  // Only admins can view users; flow admins see users in their own flow.
  const activeView: PermissionManagementView = isAdmin ? view : 'submissions'

  return (
    <PermissionManagementLayout
      activeView={activeView}
      showUsersTab={isAdmin}
      toolbarRef={setToolbarContainer}
      onViewChange={onViewChange}
    >
      {activeView === 'users'
        ? <UsersView toolbarContainer={toolbarContainer} />
        : <PermissionRequestsView toolbarContainer={toolbarContainer} />}
    </PermissionManagementLayout>
  )
}
