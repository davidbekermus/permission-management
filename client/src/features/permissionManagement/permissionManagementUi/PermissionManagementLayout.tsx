import type { ReactNode, Ref, SyntheticEvent } from "react";
import Tab from "@mui/material/Tab";
import {
  SectionDivider,
  PageWrapper,
  Toolbar,
  ToolbarActions,
  StyledTabs,
} from "./PermissionManagementPage.style";

export enum PermissionManagementView {
  USERS = "users",
  SUBMISSIONS = "submissions",
}

interface PermissionManagementLayoutProps {
  activeView: PermissionManagementView;
  showUsersTab: boolean;
  toolbarRef: Ref<HTMLDivElement>;
  onViewChange: (view: PermissionManagementView) => void;
  children: ReactNode;
}

export const PermissionManagementLayout = ({
  activeView,
  showUsersTab,
  toolbarRef,
  onViewChange,
  children,
}: PermissionManagementLayoutProps) => {
  const handleTabChange = (
    _: SyntheticEvent,
    view: PermissionManagementView,
  ) => {
    onViewChange(view);
  };

  return (
    <PageWrapper>
      <Toolbar>
        <StyledTabs
          textColor="secondary"
          indicatorColor="secondary"
          value={activeView}
          onChange={handleTabChange}
          aria-label="Permission management views"
        >
          {showUsersTab && <Tab value="users" label="Users" />}
          <Tab value="submissions" label="Permission Requests" />
        </StyledTabs>
        <ToolbarActions ref={toolbarRef} />
      </Toolbar>

      <SectionDivider />

      {children}
    </PageWrapper>
  );
};
