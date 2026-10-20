import { canReadPermissionManagement } from '@/app/auth/auth.utils'
import { PermissionManagementPage as PermissionManagementUI, type PermissionManagementPageProps } from '../permissionManagement/PermissionManagementPage'
import { UsersView } from '../permissionManagement/users/UsersView'
import { PermissionRequestsView } from '../permissionManagement/roleSubmissions/RoleSubmissionsView'
import { useUsersView } from './users/hooks/useUsersView'
import { useRoleSubmissionsView } from './roleSubmissions/hooks/useRoleSubmissionsView'

interface ViewContainerProps {
  toolbarContainer: HTMLDivElement | null
}

export const UsersContainer = ({ toolbarContainer }: ViewContainerProps) => {
  const view = useUsersView()
  return <UsersView toolbarContainer={toolbarContainer} view={view} />
}

export const PermissionRequestsContainer = ({ toolbarContainer }: ViewContainerProps) => {
  const view = useRoleSubmissionsView()
  return <PermissionRequestsView toolbarContainer={toolbarContainer} view={view} />
}

type ConnectedPermissionManagementPageProps = Pick<PermissionManagementPageProps, 'view' | 'onViewChange'>

export const PermissionManagementPage = (props: ConnectedPermissionManagementPageProps) => (
  <PermissionManagementUI
    {...props}
    canViewUsers={canReadPermissionManagement()}
    renderUsers={(toolbarContainer) => <UsersContainer toolbarContainer={toolbarContainer} />}
    renderSubmissions={(toolbarContainer) => <PermissionRequestsContainer toolbarContainer={toolbarContainer} />}
  />
)
