import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { UsersTable } from './users/UsersTable'
import { PermissionRequestsTable } from './permissionRequests/PermissionRequestsTable'
import { AddUserDialog } from './users/AddUserDialog'
import { FilterDialog, type SortOrder } from './users/FilterDialog'
import { CreateRequestDialog } from './permissionRequests/CreateRequestDialog'
import { RequestsFilterDialog } from './permissionRequests/RequestsFilterDialog'
import { useAuth } from '@/app/providers/AuthProvider'
import type { Role } from '@/features/auth/types'
import type { OverallStatus } from './permissionRequests/types'

type TabValue = 'users' | 'requests'

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}))

const Toolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  paddingBottom: theme.spacing(2.5),
  flexWrap: 'wrap',
}))

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButton-root': {
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.875rem',
    padding: theme.spacing(0.5, 2),
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
      '&:hover': { backgroundColor: theme.palette.primary.dark },
    },
  },
}))

function FilterIconButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <Tooltip title="Filter">
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          border: '1px solid',
          borderColor: count > 0 ? 'primary.main' : 'divider',
          borderRadius: 1,
          color: count > 0 ? 'primary.main' : 'text.secondary',
          p: '5px',
        }}
      >
        <Badge
          badgeContent={count}
          color="primary"
          sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 16, height: 16 } }}
        >
          <FilterListIcon fontSize="small" />
        </Badge>
      </IconButton>
    </Tooltip>
  )
}

export function PermissionManagementPage() {
  const { isAdmin } = useAuth()
  const [tab, setTab] = useState<TabValue>('users')

  // Users tab state
  const [userSearch, setUserSearch] = useState('')
  const [userDebouncedSearch, setUserDebouncedSearch] = useState('')
  const [userFilterOpen, setUserFilterOpen] = useState(false)
  const [userRoles, setUserRoles] = useState<Role[]>([])
  const [userSort, setUserSort] = useState<SortOrder>('latest')
  const [addUserOpen, setAddUserOpen] = useState(false)

  // Requests tab state
  const [reqSearch, setReqSearch] = useState('')
  const [reqDebouncedSearch, setReqDebouncedSearch] = useState('')
  const [reqFilterOpen, setReqFilterOpen] = useState(false)
  const [reqStatuses, setReqStatuses] = useState<OverallStatus[]>([])
  const [reqRoles, setReqRoles] = useState<Role[]>([])
  const [reqSort, setReqSort] = useState<SortOrder>('latest')
  const [createReqOpen, setCreateReqOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setUserDebouncedSearch(userSearch), 300)
    return () => clearTimeout(t)
  }, [userSearch])

  useEffect(() => {
    const t = setTimeout(() => setReqDebouncedSearch(reqSearch), 300)
    return () => clearTimeout(t)
  }, [reqSearch])

  const userFilterCount = userRoles.length + (userSort !== 'latest' ? 1 : 0)
  const reqFilterCount = reqStatuses.length + reqRoles.length + (reqSort !== 'latest' ? 1 : 0)

  const onTabChange = (_: React.MouseEvent, value: TabValue | null) => {
    if (value) setTab(value)
  }

  return (
    <PageWrapper>
      <Toolbar>
        <StyledToggleButtonGroup value={tab} exclusive onChange={onTabChange} size="small">
          <ToggleButton value="users">Users</ToggleButton>
          <ToggleButton value="requests">Permission Requests</ToggleButton>
        </StyledToggleButtonGroup>

        <Box sx={{ flexGrow: 1 }} />

        {tab === 'users' && (
          <>
            <TextField
              placeholder="Search by username…"
              size="small"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 260 }}
            />
            <FilterIconButton count={userFilterCount} onClick={() => setUserFilterOpen(true)} />
            {isAdmin && (
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon fontSize="small" />}
                onClick={() => setAddUserOpen(true)}
              >
                Add user
              </Button>
            )}
          </>
        )}

        {tab === 'requests' && (
          <>
            <TextField
              placeholder="Search by username…"
              size="small"
              value={reqSearch}
              onChange={(e) => setReqSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 260 }}
            />
            <FilterIconButton count={reqFilterCount} onClick={() => setReqFilterOpen(true)} />
            <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleOutlineIcon fontSize="small" />}
              onClick={() => setCreateReqOpen(true)}
            >
              Request permission
            </Button>
          </>
        )}
      </Toolbar>

      <Divider />

      <Box sx={{ pt: 2.5 }}>
        {tab === 'users' && (
          <UsersTable
            search={userDebouncedSearch}
            roleFilters={userRoles}
            sort={userSort}
          />
        )}
        {tab === 'requests' && (
          <PermissionRequestsTable
            search={reqDebouncedSearch}
            statusFilters={reqStatuses}
            roleFilters={reqRoles}
            sort={reqSort}
          />
        )}
      </Box>

      <AddUserDialog open={addUserOpen} onClose={() => setAddUserOpen(false)} />

      <FilterDialog
        open={userFilterOpen}
        onClose={() => setUserFilterOpen(false)}
        appliedRoles={userRoles}
        appliedSort={userSort}
        onApply={(roles, sort) => { setUserRoles(roles); setUserSort(sort) }}
      />

      <RequestsFilterDialog
        open={reqFilterOpen}
        onClose={() => setReqFilterOpen(false)}
        appliedStatuses={reqStatuses}
        appliedRoles={reqRoles}
        appliedSort={reqSort}
        onApply={(statuses, roles, sort) => { setReqStatuses(statuses); setReqRoles(roles); setReqSort(sort) }}
      />

      <CreateRequestDialog open={createReqOpen} onClose={() => setCreateReqOpen(false)} />
    </PageWrapper>
  )
}
