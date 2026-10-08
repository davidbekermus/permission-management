import Tab from '@mui/material/Tab'
import { StyledTabs } from '../PermissionManagementPage.style'
import type { RoleSubmissionScope } from './hooks/useRoleSubmissions'

interface RoleSubmissionsScopeTabsProps {
  scope: RoleSubmissionScope
  onScopeChange: (scope: RoleSubmissionScope) => void
}

export function RoleSubmissionsScopeTabs({ scope, onScopeChange }: RoleSubmissionsScopeTabsProps) {
  return (
    <StyledTabs
      value={scope}
      onChange={(_, value: RoleSubmissionScope) => onScopeChange(value)}
      aria-label="Permission request scopes"
    >
      <Tab value="review" label="Requests to review" id="request-scope-review" aria-controls="request-scope-panel" />
      <Tab value="mine" label="My requests" id="request-scope-mine" aria-controls="request-scope-panel" />
    </StyledTabs>
  )
}
