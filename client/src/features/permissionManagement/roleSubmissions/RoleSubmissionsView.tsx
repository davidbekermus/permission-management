import { useState } from 'react'
import { createPortal } from 'react-dom'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { RoleSubmissionsTable } from './table/RoleSubmissionsTable'
import { CreateRoleSubmissionDialog } from './CreateRoleSubmissionDialog'
import { RoleSubmissionsScopeTabs } from './RoleSubmissionsScopeTabs'
import { RoleSubmissionsStatusChips } from './RoleSubmissionsStatusChips'
import { SearchAndFilterControls } from '../shared/SearchAndFilterControls'
import { useDebounce } from '../hooks/useDebounce'
import type { RoleSubmissionScope } from './hooks/useRoleSubmissions'
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

const STATUS_FILTER_OPTIONS = ALL_STATUSES.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}))

interface PermissionRequestsViewProps {
  toolbarContainer: HTMLDivElement | null
}

interface PermissionRequestFilters {
  search: string
  statuses: RoleSubmissionStatus[]
  roles: Roles[]
  sort: SortOrder
}

const getInitialFilters = (isAdmin: boolean): PermissionRequestFilters => ({
  search: '',
  statuses: isAdmin ? [RoleSubmissionStatus.PENDING] : [],
  roles: [],
  sort: 'latest',
})

export function PermissionRequestsView({ toolbarContainer }: PermissionRequestsViewProps) {
  const isAdmin = canReadPermissionManagement()
  const [selectedScope, setSelectedScope] = useState<RoleSubmissionScope>(isAdmin ? 'review' : 'mine')
  const scope = isAdmin ? selectedScope : 'mine'
  const [filters, setFilters] = useState<PermissionRequestFilters>(() => getInitialFilters(isAdmin))
  const { search, statuses, roles, sort } = filters
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const debouncedSearch = useDebounce(search, 300)
  const filterCount = statuses.length + roles.length + (sort !== 'latest' ? 1 : 0)
  const roleOptions = scope === 'review' ? getRolesInAdminScope() : ALL_ROLES

  const changeScope = (nextScope: RoleSubmissionScope) => {
    setSelectedScope(nextScope)
    setFilters(getInitialFilters(isAdmin))
  }

  const toolbarActions = (
    <>
      <SearchAndFilterControls
        key={scope}
        showSearch={scope === 'review'}
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
    <>
      {/* Keep view controls in the shared toolbar while their state stays in this view. */}
      {toolbarContainer && createPortal(toolbarActions, toolbarContainer)}
      <div>
        <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 2 }}>
          {isAdmin && (
            <RoleSubmissionsScopeTabs scope={scope} onScopeChange={changeScope} />
          )}
          {isAdmin && statuses.length > 0 && (
            <RoleSubmissionsStatusChips
              statuses={statuses}
              onStatusDelete={(status) => {
                setFilters((current) => ({
                  ...current,
                  statuses: current.statuses.filter((item) => item !== status),
                }))
              }}
            />
          )}

        </Stack>
        <div
          role={isAdmin ? 'tabpanel' : undefined}
          id="request-scope-panel"
          aria-labelledby={isAdmin ? `request-scope-${scope}` : undefined}
        >
          <RoleSubmissionsTable
            scope={scope}
            search={scope === 'review' ? debouncedSearch : ''}
            statusFilters={statuses}
            roleFilters={roles}
            sort={sort}
          />
        </div>
      </div>

      <CreateRoleSubmissionDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmitted={() => changeScope('mine')}
      />
    </>
  )
}
