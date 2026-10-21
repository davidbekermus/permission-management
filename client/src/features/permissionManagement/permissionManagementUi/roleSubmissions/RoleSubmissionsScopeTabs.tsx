import Tab from "@mui/material/Tab";
import { StyledTabs } from "../PermissionManagementPage.style";
import type { RoleSubmissionScope } from "./types";

interface RoleSubmissionsScopeTabsProps {
  scope: RoleSubmissionScope;
  onScopeChange: (scope: RoleSubmissionScope) => void;
}

export const RoleSubmissionsScopeTabs = ({
  scope,
  onScopeChange,
}: RoleSubmissionsScopeTabsProps) => {
  return (
    <StyledTabs
      textColor="secondary"
      indicatorColor="secondary"
      value={scope}
      onChange={(_, value: RoleSubmissionScope) => onScopeChange(value)}
      aria-label="Permission request scopes"
    >
      <Tab
        value="review"
        label="Requests to review"
        id="request-scope-review"
        aria-controls="request-scope-panel"
      />
      <Tab
        value="mine"
        label="My requests"
        id="request-scope-mine"
        aria-controls="request-scope-panel"
      />
    </StyledTabs>
  );
};
