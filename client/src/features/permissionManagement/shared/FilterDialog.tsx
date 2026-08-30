import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import type { Roles, SortOrder } from './types'
import {
  StyledDialogTitle,
  StyledDivider,
  StyledDialogActions,
  FieldStack,
  ButtonRow,
  FilterSectionLabel,
} from './DialogStyles.style'
import { FilterSection, StatusChips, StyledSortToggleButton } from './FilterDialog.style'

interface StatusOption<TStatus extends string> {
  value: TStatus
  label: string
}

interface FilterDialogProps<TStatus extends string> {
  title: string
  open: boolean
  onClose: () => void
  appliedRoles: Roles[]
  appliedSort: SortOrder
  roleOptions: Roles[]
  statusOptions?: StatusOption<TStatus>[]
  appliedStatuses?: TStatus[]
  onApply: (roles: Roles[], sort: SortOrder, statuses: TStatus[]) => void
}

interface SelectedFilters<TStatus extends string> {
  roles: Roles[]
  sort: SortOrder
  statuses: TStatus[]
}

export function FilterDialog<TStatus extends string = never>({
  title,
  open,
  onClose,
  appliedRoles,
  appliedSort,
  roleOptions,
  statusOptions,
  appliedStatuses,
  onApply,
}: FilterDialogProps<TStatus>) {
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters<TStatus>>({
    roles: appliedRoles,
    sort: appliedSort,
    statuses: appliedStatuses ?? [],
  })
  const { roles, sort, statuses } = selectedFilters

  useEffect(() => {
    if (open) {
      setSelectedFilters({
        roles: appliedRoles,
        sort: appliedSort,
        statuses: appliedStatuses ?? [],
      })
    }
  }, [open, appliedRoles, appliedSort, appliedStatuses])

  const toggleStatus = (status: TStatus) => {
    setSelectedFilters((current) => ({
      ...current,
      statuses: current.statuses.includes(status)
        ? current.statuses.filter((item) => item !== status)
        : [...current.statuses, status],
    }))
  }

  const handleApply = () => {
    onApply(roles, sort, statuses)
    onClose()
  }

  const handleClear = () => {
    setSelectedFilters({ roles: [], sort: 'latest', statuses: [] })
  }

  const hasSelectedFilters = roles.length > 0 || sort !== 'latest' || statuses.length > 0

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <StyledDialogTitle>{title}</StyledDialogTitle>
      <StyledDivider />
      <DialogContent>
        <FieldStack>
          <FilterSection>
            <FilterSectionLabel variant="caption" color="text.secondary">
              Sort by date
            </FilterSectionLabel>
            <ToggleButtonGroup
              value={sort}
              exclusive
              onChange={(_, value) => {
                if (value) setSelectedFilters((current) => ({ ...current, sort: value }))
              }}
              size="small"
              fullWidth
            >
              <StyledSortToggleButton value="latest">Latest first</StyledSortToggleButton>
              <StyledSortToggleButton value="oldest">Oldest first</StyledSortToggleButton>
            </ToggleButtonGroup>
          </FilterSection>

          {statusOptions && statusOptions.length > 0 && (
            <FilterSection>
              <FilterSectionLabel variant="caption" color="text.secondary">
                Status
              </FilterSectionLabel>
              <StatusChips>
                {statusOptions.map(({ value, label }) => (
                  <Chip
                    key={value}
                    label={label}
                    onClick={() => toggleStatus(value)}
                    variant={statuses.includes(value) ? 'filled' : 'outlined'}
                    color={statuses.includes(value) ? 'primary' : 'default'}
                    size="small"
                    clickable
                  />
                ))}
              </StatusChips>
            </FilterSection>
          )}

          <FilterSection>
            <FilterSectionLabel variant="caption" color="text.secondary">
              Roles
            </FilterSectionLabel>
            <Autocomplete
              multiple
              options={roleOptions}
              value={roles}
              onChange={(_, value) => setSelectedFilters((current) => ({ ...current, roles: value }))}
              getOptionLabel={(role) => role.toLowerCase().replace(/_/g, '-')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={roles.length === 0 ? 'Any role...' : ''}
                  size="small"
                />
              )}
              disableCloseOnSelect
            />
          </FilterSection>
        </FieldStack>
      </DialogContent>
      <Divider />
      <StyledDialogActions>
        <Button size="small" color="inherit" onClick={handleClear} disabled={!hasSelectedFilters}>
          Clear all
        </Button>
        <ButtonRow>
          <Button color="inherit" onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleApply}>Apply</Button>
        </ButtonRow>
      </StyledDialogActions>
    </Dialog>
  )
}
