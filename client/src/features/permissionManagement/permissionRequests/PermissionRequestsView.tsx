import { useState } from 'react'
import Button from '@mui/material/Button'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { RoleSubmissionsTable } from './RoleSubmissionsTable'
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
  STATUS_LABELS,
  type RoleSubmissionStatus,
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

export function PermissionRequestsView({ onViewChange }: PermissionRequestsViewProps) {
  const isAdmin = canReadPermissionManagement()
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState<RoleSubmissionStatus[]>(['PENDING'])
  const [roles, setRoles] = useState<Roles[]>([])
  const [sort, setSort] = useState<SortOrder>('latest')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const debouncedSearch = useDebounce(search, 300)
  const filterCount = statuses.length + roles.length + (sort !== 'latest' ? 1 : 0)
  const roleOptions = isAdmin ? getRolesInAdminScope() : ALL_ROLES

  const toolbarActions = (
    <>
      <SearchAndFilterControls
        dialogTitle="Filter Permission Requests"
        search={search}
        onSearchChange={setSearch}
        filterCount={filterCount}
        appliedRoles={roles}
        appliedSort={sort}
        roleOptions={roleOptions}
        statusOptions={STATUS_FILTER_OPTIONS}
        appliedStatuses={statuses}
        onApply={(selectedRoles, selectedSort, selectedStatuses) => {
          setRoles(selectedRoles)
          setSort(selectedSort)
          setStatuses(selectedStatuses)
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
