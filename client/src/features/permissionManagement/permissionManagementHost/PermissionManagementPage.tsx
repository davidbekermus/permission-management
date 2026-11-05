import { canReadPermissionManagement } from "@/app/auth/auth.utils";
import {
  PermissionManagementPage as PermissionManagementUI,
  type PermissionManagementPageProps,
} from "../permissionManagementUi/PermissionManagementPage";
import { UsersView } from "../permissionManagementUi/users/UsersView";
import { PermissionRequestsView } from "../permissionManagementUi/roleSubmissions/RoleSubmissionsView";
import { useUsersView } from "./users/hooks/useUsersView";
import { useRoleSubmissionsView } from "./roleSubmissions/hooks/useRoleSubmissionsView";
import { PageFrame } from "./PermissionManagementPage.style";

interface ViewContainerProps {
  toolbarContainer: HTMLDivElement | null;
}

export const UsersContainer = ({ toolbarContainer }: ViewContainerProps) => {
  const viewModel = useUsersView();
  return (
    <UsersView toolbarContainer={toolbarContainer} viewModel={viewModel} />;
  )
};

export const PermissionRequestsContainer = ({
  toolbarContainer,
}: ViewContainerProps) => {
  const viewModel = useRoleSubmissionsView();
  return (
    <PermissionRequestsView toolbarContainer={toolbarContainer} viewModel={viewModel} />
  );
};

type ConnectedPermissionManagementPageProps = Pick<
  PermissionManagementPageProps,
  "view" | "onViewChange"
>;

export const PermissionManagementPage = (
  props: ConnectedPermissionManagementPageProps,
) => (
  <PageFrame>
    <PermissionManagementUI
      {...props}
      canViewUsers={canReadPermissionManagement()}
      renderUsers={(toolbarContainer) => (
        <UsersContainer toolbarContainer={toolbarContainer} />
      )}
      renderSubmissions={(toolbarContainer) => (
        <PermissionRequestsContainer toolbarContainer={toolbarContainer} />
      )}
    />
  </PageFrame>
);
