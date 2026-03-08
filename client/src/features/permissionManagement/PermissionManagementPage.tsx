import { useState } from 'react'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { UsersTable } from './users/UsersTable'
import { PermissionRequestsTable } from './permissionRequests/PermissionRequestsTable'

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 1200,
}))

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}))

export function PermissionManagementPage() {
  const [tab, setTab] = useState(0)

  return (
    <PageWrapper>
      <Typography variant="h5" gutterBottom>
        Permission Management
      </Typography>
      <StyledTabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Users" />
        <Tab label="Permission Requests" />
      </StyledTabs>
      {tab === 0 && <UsersTable />}
      {tab === 1 && <PermissionRequestsTable />}
    </PageWrapper>
  )
}
