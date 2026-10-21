import { useState, type ReactNode } from "react";
import {
  PermissionManagementLayout,
  type PermissionManagementView,
} from "./PermissionManagementLayout";

export interface PermissionManagementPageProps {
  view: PermissionManagementView;
  onViewChange: (view: PermissionManagementView) => void;
  canViewUsers: boolean;
  renderUsers: (toolbarContainer: HTMLDivElement | null) => ReactNode;
  renderSubmissions: (toolbarContainer: HTMLDivElement | null) => ReactNode;
}

export const PermissionManagementPage = ({
  view,
  onViewChange,
  canViewUsers,
  renderUsers,
  renderSubmissions,
}: PermissionManagementPageProps) => {
  const [toolbarContainer, setToolbarContainer] =
    useState<HTMLDivElement | null>(null);
  // Only admins can view users; flow admins see users in their own flow.
  const activeView: PermissionManagementView = canViewUsers
    ? view
    : "submissions";

  return (
    <PermissionManagementLayout
      activeView={activeView}
      showUsersTab={canViewUsers}
      toolbarRef={setToolbarContainer}
      onViewChange={onViewChange}
    >
      {activeView === "users"
        ? renderUsers(toolbarContainer)
        : renderSubmissions(toolbarContainer)}
    </PermissionManagementLayout>
  );
};
