import type { ReactNode, SyntheticEvent } from 'react'
import Tab from '@mui/material/Tab'
import Divider from '@mui/material/Divider'
import {
  PageWrapper,
  Toolbar,
  FlexSpacer,
  ContentBox,
  StyledTabs,
} from './PermissionManagementPage.style'

export type PermissionManagementView = 'users' | 'submissions'

interface PermissionManagementLayoutProps {
  activeView: PermissionManagementView
  showUsersTab: boolean
  toolbarActions: ReactNode
  onViewChange: (view: PermissionManagementView) => void
  children: ReactNode
}

export function PermissionManagementLayout({
  activeView,
  showUsersTab,
  toolbarActions,
  onViewChange,
  children,
}: PermissionManagementLayoutProps) {
  const handleTabChange = (_: SyntheticEvent, view: PermissionManagementView) => {
    onViewChange(view)
  }

  return (
    <PageWrapper>
      <Toolbar>
        <StyledTabs
          value={activeView}
          onChange={handleTabChange}
          aria-label="Permission management views"
        >
          {showUsersTab && <Tab value="users" label="Users" />}
          <Tab value="submissions" label="Permission Requests" />
        </StyledTabs>
        <FlexSpacer />
        {toolbarActions}
      </Toolbar>

      <Divider />

      <ContentBox>{children}</ContentBox>
    </PageWrapper>
  )
}
