import { useState } from 'react'
import ToggleButton from '@mui/material/ToggleButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import FilterListIcon from '@mui/icons-material/FilterList'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { UsersTable } from './users/UsersTable'
import { PermissionRequestsTable } from './permissionRequests/PermissionRequestsTable'
import { AddUserDialog } from './users/AddUserDialog'
import { FilterDialog } from './users/FilterDialog'
import { CreateRequestDialog } from './permissionRequests/CreateRequestDialog'
import { RequestsFilterDialog } from './permissionRequests/RequestsFilterDialog'
import { useAuth } from '@/app/providers/AuthProvider'
import { useDebounce } from './hooks/useDebounce'
import type { Role } from '@/features/auth/types'
import type { OverallStatus } from './permissionRequests/types'
import type { SortOrder } from './shared/types'
import {
  PageWrapper,
  Toolbar,
  FlexSpacer,
  ContentBox,
  ScreenReaderOnly,
  StyledToggleButtonGroup,
  StyledFilterIconButton,
  StyledBadge,
  SearchField,
  SearchAdornmentIcon,
} from './PermissionManagementPage.style'

type TabValue = 'users' | 'requests'

// Each tab has its own independent search + filter + dialog state.
// State is kept at the page level so switching tabs preserves your in-progress filters.
export function PermissionManagementPage() {
  const { isAnomalyAdmin } = useAuth()
  const [tab, setTab] = useState<TabValue>('users')

  // Users tab state
  const [userSearch, setUserSearch] = useState('')
  const [userFilterOpen, setUserFilterOpen] = useState(false)
  const [userRoles, setUserRoles] = useState<Role[]>([])
  const [userSort, setUserSort] = useState<SortOrder>('latest')
  const [addUserOpen, setAddUserOpen] = useState(false)

  // Requests tab state
  const [reqSearch, setReqSearch] = useState('')
  const [reqFilterOpen, setReqFilterOpen] = useState(false)
  const [reqStatuses, setReqStatuses] = useState<OverallStatus[]>([])
  const [reqRoles, setReqRoles] = useState<Role[]>([])
  const [reqSort, setReqSort] = useState<SortOrder>('latest')
  const [createReqOpen, setCreateReqOpen] = useState(false)

  // Debounce delays the API call until the user stops typing (300 ms).
  // The raw search state updates immediately so the input feels responsive.
  const userDebouncedSearch = useDebounce(userSearch, 300)
  const reqDebouncedSearch = useDebounce(reqSearch, 300)

  // Each active filter beyond the default counts as 1 — drives the badge on the filter icon.
  // Sort 'latest' is the default so it doesn't count; 'oldest' adds 1.
  const userFilterCount = userRoles.length + (userSort !== 'latest' ? 1 : 0)
  const reqFilterCount = reqStatuses.length + reqRoles.length + (reqSort !== 'latest' ? 1 : 0)

  // Narrated by screen readers when the active tab or search/filter state changes.
  // aria-live="polite" waits for the user to stop typing before reading aloud.
  const announcement =
    tab === 'users'
      ? [
          'Users tab',
          userDebouncedSearch && `filtered by "${userDebouncedSearch}"`,
          userRoles.length && `roles: ${userRoles.join(', ')}`,
        ].filter(Boolean).join(', ')
      : [
          'Permission requests tab',
          reqDebouncedSearch && `filtered by "${reqDebouncedSearch}"`,
          reqStatuses.length && `status: ${reqStatuses.join(', ')}`,
        ].filter(Boolean).join(', ')

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

        <FlexSpacer />

        {tab === 'users' && (
          <>
            <SearchField
              placeholder="Search by username…"
              size="small"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchAdornmentIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Filter">
              <StyledFilterIconButton
                size="small"
                $active={userFilterCount > 0}
                onClick={() => setUserFilterOpen(true)}
              >
                <StyledBadge badgeContent={userFilterCount} color="primary">
                  <FilterListIcon fontSize="small" />
                </StyledBadge>
              </StyledFilterIconButton>
            </Tooltip>
            {isAnomalyAdmin && (
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
            <SearchField
              placeholder="Search by username…"
              size="small"
              value={reqSearch}
              onChange={(e) => setReqSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchAdornmentIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Filter">
              <StyledFilterIconButton
                size="small"
                $active={reqFilterCount > 0}
                onClick={() => setReqFilterOpen(true)}
              >
                <StyledBadge badgeContent={reqFilterCount} color="primary">
                  <FilterListIcon fontSize="small" />
                </StyledBadge>
              </StyledFilterIconButton>
            </Tooltip>
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

      <ScreenReaderOnly aria-live="polite" aria-atomic="true">
        {announcement}
      </ScreenReaderOnly>

      <ContentBox>
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
      </ContentBox>

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
