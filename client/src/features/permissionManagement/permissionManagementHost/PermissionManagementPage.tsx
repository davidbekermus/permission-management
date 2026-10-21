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
  const view = useUsersView();
  return <UsersView toolbarContainer={toolbarContainer} view={view} />;
};

export const PermissionRequestsContainer = ({
  toolbarContainer,
}: ViewContainerProps) => {
  const view = useRoleSubmissionsView();
  return (
    <PermissionRequestsView toolbarContainer={toolbarContainer} view={view} />
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
