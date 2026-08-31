import { useState } from 'react'
import InputAdornment from '@mui/material/InputAdornment'
import Tooltip from '@mui/material/Tooltip'
import FilterListIcon from '@mui/icons-material/FilterList'
import { FilterDialog } from './FilterDialog'
import type { Roles, SortOrder } from './types'
import {
  StyledFilterIconButton,
  StyledBadge,
  SearchField,
  SearchAdornmentIcon,
} from '../PermissionManagementPage.style'

interface StatusOption<TStatus extends string> {
  value: TStatus
  label: string
}

interface SearchAndFilterControlsProps<TStatus extends string> {
  dialogTitle: string
  search: string
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
      <SearchField
        placeholder="Search by username..."
        size="small"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
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
          $active={filterCount > 0}
          onClick={() => setFilterOpen(true)}
        >
          <StyledBadge badgeContent={filterCount} color="primary">
            <FilterListIcon fontSize="small" />
          </StyledBadge>
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
