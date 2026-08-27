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
import { RoleSubmissionsTable } from './permissionRequests/RoleSubmissionsTable'
import { AddUserDialog } from './users/AddUserDialog'
import { FilterDialog } from './users/FilterDialog'
import { CreateRoleSubmissionDialog } from './permissionRequests/CreateRoleSubmissionDialog'
import { RoleSubmissionsFilterDialog } from './permissionRequests/RoleSubmissionsFilterDialog'
import { useAuth } from '@/app/providers/AuthProvider'
import { useDebounce } from './hooks/useDebounce'
import type { Role } from '@/features/auth/types'
import type { RoleSubmissionStatus } from './permissionRequests/types'
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

type TabValue = 'users' | 'submissions'

export function PermissionManagementPage() {
  const { isAnomalyAdmin } = useAuth()
  const [tab, setTab] = useState<TabValue>('users')

  const [userSearch, setUserSearch] = useState('')
  const [userFilterOpen, setUserFilterOpen] = useState(false)
  const [userRoles, setUserRoles] = useState<Role[]>([])
  const [userSort, setUserSort] = useState<SortOrder>('latest')
  const [addUserOpen, setAddUserOpen] = useState(false)

  const [submissionSearch, setSubmissionSearch] = useState('')
  const [submissionFilterOpen, setSubmissionFilterOpen] = useState(false)
  const [submissionStatuses, setSubmissionStatuses] = useState<RoleSubmissionStatus[]>([])
  const [submissionRoles, setSubmissionRoles] = useState<Role[]>([])
  const [submissionSort, setSubmissionSort] = useState<SortOrder>('latest')
  const [createSubmissionOpen, setCreateSubmissionOpen] = useState(false)

  const userDebouncedSearch = useDebounce(userSearch, 300)
  const submissionDebouncedSearch = useDebounce(submissionSearch, 300)

  const userFilterCount = userRoles.length + (userSort !== 'latest' ? 1 : 0)
  const submissionFilterCount =
    submissionStatuses.length + submissionRoles.length + (submissionSort !== 'latest' ? 1 : 0)

  const announcement =
    tab === 'users'
      ? [
          'Users tab',
          userDebouncedSearch && `filtered by "${userDebouncedSearch}"`,
          userRoles.length && `roles: ${userRoles.join(', ')}`,
        ].filter(Boolean).join(', ')
      : [
          'Permission requests tab',
          submissionDebouncedSearch && `filtered by "${submissionDebouncedSearch}"`,
          submissionStatuses.length && `status: ${submissionStatuses.join(', ')}`,
        ].filter(Boolean).join(', ')

  const onTabChange = (_: React.MouseEvent, value: TabValue | null) => {
    if (value) setTab(value)
  }

  return (
    <PageWrapper>
      <Toolbar>
        <StyledToggleButtonGroup value={tab} exclusive onChange={onTabChange} size="small">
          <ToggleButton value="users">Users</ToggleButton>
          <ToggleButton value="submissions">Permission Requests</ToggleButton>
        </StyledToggleButtonGroup>

        <FlexSpacer />

        {tab === 'users' && (
          <>
            <SearchField
              placeholder="Search by username..."
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

        {tab === 'submissions' && (
          <>
            <SearchField
              placeholder="Search by username..."
              size="small"
              value={submissionSearch}
              onChange={(e) => setSubmissionSearch(e.target.value)}
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
                $active={submissionFilterCount > 0}
                onClick={() => setSubmissionFilterOpen(true)}
              >
                <StyledBadge badgeContent={submissionFilterCount} color="primary">
                  <FilterListIcon fontSize="small" />
                </StyledBadge>
              </StyledFilterIconButton>
            </Tooltip>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleOutlineIcon fontSize="small" />}
              onClick={() => setCreateSubmissionOpen(true)}
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
        {tab === 'submissions' && (
          <RoleSubmissionsTable
            search={submissionDebouncedSearch}
            statusFilters={submissionStatuses}
            roleFilters={submissionRoles}
            sort={submissionSort}
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

      <RoleSubmissionsFilterDialog
        open={submissionFilterOpen}
        onClose={() => setSubmissionFilterOpen(false)}
        appliedStatuses={submissionStatuses}
        appliedRoles={submissionRoles}
        appliedSort={submissionSort}
        onApply={(statuses, roles, sort) => {
          setSubmissionStatuses(statuses)
          setSubmissionRoles(roles)
          setSubmissionSort(sort)
        }}
      />

      <CreateRoleSubmissionDialog
        open={createSubmissionOpen}
        onClose={() => setCreateSubmissionOpen(false)}
      />
    </PageWrapper>
  )
}
