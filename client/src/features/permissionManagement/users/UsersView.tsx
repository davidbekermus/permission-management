import { useState } from 'react'
import { createPortal } from 'react-dom'
import Button from '@mui/material/Button'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { UsersTable } from './table/UsersTable'
import { AddUserDialog } from './AddUserDialog'
import { SearchAndFilterControls } from '../shared/SearchAndFilterControls'
import { useDebounce } from '../hooks/useDebounce'
import { canManagePermissions, getRolesInAdminScope } from '@/app/auth/auth.utils'
import type { Roles, SortOrder } from '../shared/types'

interface UsersViewProps {
  toolbarContainer: HTMLDivElement | null
}

export function UsersView({ toolbarContainer }: UsersViewProps) {
  const isAnomalyAdmin = canManagePermissions()
  const [search, setSearch] = useState('')
  const [roles, setRoles] = useState<Roles[]>([])
  const [sort, setSort] = useState<SortOrder>('latest')
  const [addUserOpen, setAddUserOpen] = useState(false)
  const debouncedSearch = useDebounce(search, 300)
  const filterCount = roles.length + (sort !== 'latest' ? 1 : 0)

  const toolbarActions = (
    <>
      <SearchAndFilterControls
        dialogTitle="Filter Users"
        search={search}
        onSearchChange={setSearch}
        filterCount={filterCount}
        appliedRoles={roles}
        appliedSort={sort}
        roleOptions={getRolesInAdminScope()}
        onApply={(selectedRoles, selectedSort) => {
          setRoles(selectedRoles)
          setSort(selectedSort)
        }}
      />
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
  )

  return (
    <>
      {/* Keep view controls in the shared toolbar while their state stays in this view. */}
      {toolbarContainer && createPortal(toolbarActions, toolbarContainer)}
      <UsersTable search={debouncedSearch} roleFilters={roles} sort={sort} />

      <AddUserDialog open={addUserOpen} onClose={() => setAddUserOpen(false)} />

    </>
  )
}
