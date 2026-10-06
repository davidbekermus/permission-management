import { useState } from 'react'
import InputAdornment from '@mui/material/InputAdornment'
import Tooltip from '@mui/material/Tooltip'
import Badge from '@mui/material/Badge'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import { FilterDialog } from './FilterDialog'
import type { Roles, SortOrder } from './types'
import {
  StyledFilterIconButton,
  SearchField,
} from '../PermissionManagementPage.style'

interface StatusOption<TStatus extends string> {
  value: TStatus
  label: string
}

interface SearchAndFilterControlsProps<TStatus extends string> {
  dialogTitle: string
  search: string
  showSearch?: boolean
  onSearchChange: (search: string) => void
  filterCount: number
  appliedRoles: Roles[]
  appliedSort: SortOrder
  roleOptions: Roles[]
  statusOptions?: StatusOption<TStatus>[]
  appliedStatuses?: TStatus[]
  onApply: (roles: Roles[], sort: SortOrder, statuses: TStatus[]) => void
}

export function SearchAndFilterControls<TStatus extends string = never>({
  dialogTitle,
  search,
  showSearch = true,
  onSearchChange,
  filterCount,
  appliedRoles,
  appliedSort,
  roleOptions,
  statusOptions,
  appliedStatuses,
  onApply,
}: SearchAndFilterControlsProps<TStatus>) {
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <>
      {showSearch && <SearchField
        placeholder="Search by username..."
        size="small"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />}
      <Tooltip title="Filter">
        <StyledFilterIconButton
          size="small"
          $active={filterCount > 0}
          onClick={() => setFilterOpen(true)}
        >
          <Badge badgeContent={filterCount} color="primary">
            <FilterListIcon fontSize="small" />
          </Badge>
        </StyledFilterIconButton>
      </Tooltip>

      <FilterDialog
        title={dialogTitle}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        appliedRoles={appliedRoles}
        appliedSort={appliedSort}
        roleOptions={roleOptions}
        statusOptions={statusOptions}
        appliedStatuses={appliedStatuses}
        onApply={onApply}
      />
    </>
  )
}
