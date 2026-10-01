import { useState } from 'react'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { RoleSubmissionsTable } from './table/RoleSubmissionsTable'
import { CreateRoleSubmissionDialog } from './CreateRoleSubmissionDialog'
import { SearchAndFilterControls } from '../shared/SearchAndFilterControls'
import { useDebounce } from '../hooks/useDebounce'
import {
  canReadPermissionManagement,
  getRolesInAdminScope,
} from '@/app/auth/auth.utils'
import { ALL_ROLES, type Roles, type SortOrder } from '../shared/types'
import {
  ALL_STATUSES,
  RoleSubmissionStatus,
  STATUS_LABELS,
} from './types'
import {
  PermissionManagementLayout,
  type PermissionManagementView,
} from '../PermissionManagementLayout'

const STATUS_FILTER_OPTIONS = ALL_STATUSES.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}))

interface PermissionRequestsViewProps {
  onViewChange: (view: PermissionManagementView) => void
}

interface PermissionRequestFilters {
  search: string
  statuses: RoleSubmissionStatus[]
  roles: Roles[]
  sort: SortOrder
}

const INITIAL_FILTERS: PermissionRequestFilters = {
  search: '',
  statuses: [RoleSubmissionStatus.PENDING],
  roles: [],
  sort: 'latest',
}

export function PermissionRequestsView({ onViewChange }: PermissionRequestsViewProps) {
  const isAdmin = canReadPermissionManagement()
  const [filters, setFilters] = useState<PermissionRequestFilters>(INITIAL_FILTERS)
  const { search, statuses, roles, sort } = filters
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const debouncedSearch = useDebounce(search, 300)
  const filterCount = statuses.length + roles.length + (sort !== 'latest' ? 1 : 0)
  const roleOptions = isAdmin ? getRolesInAdminScope() : ALL_ROLES

  const toolbarActions = (
    <>
      <SearchAndFilterControls
        dialogTitle="Filter Permission Requests"
        search={search}
        onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
        filterCount={filterCount}
        appliedRoles={roles}
        appliedSort={sort}
        roleOptions={roleOptions}
        statusOptions={STATUS_FILTER_OPTIONS}
        appliedStatuses={statuses}
        onApply={(selectedRoles, selectedSort, selectedStatuses) => {
          setFilters((current) => ({
            ...current,
            roles: selectedRoles,
            sort: selectedSort,
            statuses: selectedStatuses,
          }))
        }}
      />
      <Button
        variant="contained"
        size="small"
        startIcon={<AddCircleOutlineIcon fontSize="small" />}
        onClick={() => setCreateDialogOpen(true)}
      >
        Request permission
      </Button>
    </>
  )

  return (
    <PermissionManagementLayout
      activeView="submissions"
      showUsersTab={isAdmin}
      toolbarActions={toolbarActions}
      onViewChange={onViewChange}
    >
      {statuses.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 2 }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing:
          </Typography>
          {statuses.map((status) => (
            <Chip
              key={status}
              label={STATUS_LABELS[status]}
              size="small"
              variant="outlined"
              onDelete={() => {
                setFilters((current) => ({
                  ...current,
                  statuses: current.statuses.filter((item) => item !== status),
                }))
              }}
            />
          ))}
        </Stack>
      )}

      <RoleSubmissionsTable
        search={debouncedSearch}
        statusFilters={statuses}
        roleFilters={roles}
        sort={sort}
      />

      <CreateRoleSubmissionDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </PermissionManagementLayout>
  )
}
