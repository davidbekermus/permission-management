import { useState } from 'react'
import Tab from '@mui/material/Tab'
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
import {
  canManagePermissions,
  canReadPermissionManagement,
  getRolesInAdminScope,
} from '@/app/auth/auth.utils'
import { useNavigate } from '@tanstack/react-router'
import { useDebounce } from './hooks/useDebounce'
import { ALL_ROLES, type Role } from '@/features/auth/types'
import type { RoleSubmissionStatus } from './permissionRequests/types'
import type { SortOrder } from './shared/types'
import {
  PageWrapper,
  Toolbar,
  FlexSpacer,
  ContentBox,
  ScreenReaderOnly,
  StyledTabs,
  StyledFilterIconButton,
  StyledBadge,
  SearchField,
  SearchAdornmentIcon,
} from './PermissionManagementPage.style'

type TabValue = 'users' | 'submissions'

interface PermissionManagementPageProps {
  view: TabValue
}

export function PermissionManagementPage({ view }: PermissionManagementPageProps) {
  const isAdmin = canReadPermissionManagement()
  const isAnomalyAdmin = canManagePermissions()
  const filterRoleOptions = isAdmin ? getRolesInAdminScope() : ALL_ROLES
  const navigate = useNavigate()
  const activeTab: TabValue = isAdmin ? view : 'submissions'

  const [userSearch, setUserSearch] = useState('')
  const [userFilterOpen, setUserFilterOpen] = useState(false)
  const [userRoles, setUserRoles] = useState<Role[]>([])
  const [userSort, setUserSort] = useState<SortOrder>('latest')
  const [addUserOpen, setAddUserOpen] = useState(false)

  const [submissionSearch, setSubmissionSearch] = useState('')
  const [submissionFilterOpen, setSubmissionFilterOpen] = useState(false)
  const [submissionStatuses, setSubmissionStatuses] = useState<RoleSubmissionStatus[]>(['PENDING'])
  const [submissionRoles, setSubmissionRoles] = useState<Role[]>([])
  const [submissionSort, setSubmissionSort] = useState<SortOrder>('latest')
  const [createSubmissionOpen, setCreateSubmissionOpen] = useState(false)

  const userDebouncedSearch = useDebounce(userSearch, 300)
  const submissionDebouncedSearch = useDebounce(submissionSearch, 300)

  const userFilterCount = userRoles.length + (userSort !== 'latest' ? 1 : 0)
  const submissionFilterCount =
    submissionStatuses.length + submissionRoles.length + (submissionSort !== 'latest' ? 1 : 0)

  const announcement =
    activeTab === 'users'
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

  const onTabChange = (_: React.SyntheticEvent, value: TabValue) => {
    navigate({
      to: value === 'users'
        ? '/app/settings/users'
        : '/app/settings/permission-requests',
    })
  }

  return (
    <PageWrapper>
      <Toolbar>
        <StyledTabs value={activeTab} onChange={onTabChange} aria-label="Permission management views">
          {isAdmin && <Tab value="users" label="Users" />}
          <Tab value="submissions" label="Permission Requests" />
        </StyledTabs>

        <FlexSpacer />

        {activeTab === 'users' && (
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

        {activeTab === 'submissions' && (
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
        {activeTab === 'users' && (
          <UsersTable
            search={userDebouncedSearch}
            roleFilters={userRoles}
            sort={userSort}
          />
        )}
        {activeTab === 'submissions' && (
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
        roleOptions={filterRoleOptions}
        onApply={(roles, sort) => { setUserRoles(roles); setUserSort(sort) }}
      />

      <RoleSubmissionsFilterDialog
        open={submissionFilterOpen}
        onClose={() => setSubmissionFilterOpen(false)}
        appliedStatuses={submissionStatuses}
        appliedRoles={submissionRoles}
        appliedSort={submissionSort}
        roleOptions={filterRoleOptions}
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
