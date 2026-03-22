import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import { ALL_ROLES, type Role } from '@/features/auth/types'
import type { OverallStatus } from './types'
import type { SortOrder } from '../shared/types'
import { ALL_STATUSES, STATUS_LABELS } from '../shared/types'
import {
  StyledDialogTitle,
  StyledDivider,
  StyledDialogActions,
  FieldStack,
  ButtonRow,
  FilterSectionLabel,
  Section,
  StatusChips,
  StyledSortToggleButton,
} from './RequestsFilterDialog.style'

interface RequestsFilterDialogProps {
  open: boolean
  onClose: () => void
  appliedStatuses: OverallStatus[]
  appliedRoles: Role[]
  appliedSort: SortOrder
  onApply: (statuses: OverallStatus[], roles: Role[], sort: SortOrder) => void
}

// Same draft state pattern as FilterDialog — edits are local until Apply is clicked.
export function RequestsFilterDialog({
  open, onClose, appliedStatuses, appliedRoles, appliedSort, onApply,
}: RequestsFilterDialogProps) {
  const [draftStatuses, setDraftStatuses] = useState<OverallStatus[]>(appliedStatuses)
  const [draftRoles, setDraftRoles] = useState<Role[]>(appliedRoles)
  const [draftSort, setDraftSort] = useState<SortOrder>(appliedSort)

  // Re-sync draft on open so stale state from a previous session is discarded
  useEffect(() => {
    if (open) {
      setDraftStatuses(appliedStatuses)
      setDraftRoles(appliedRoles)
      setDraftSort(appliedSort)
    }
  }, [open, appliedStatuses, appliedRoles, appliedSort])

  // Click a status chip to add it; click again to remove — multi-select toggle
  const toggleStatus = (s: OverallStatus) => {
    setDraftStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )
  }

  const handleApply = () => {
    onApply(draftStatuses, draftRoles, draftSort)
    onClose()
  }

  const handleClear = () => {
    setDraftStatuses([])
    setDraftRoles([])
    setDraftSort('latest')
  }

  const isDirty = draftStatuses.length > 0 || draftRoles.length > 0 || draftSort !== 'latest'

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <StyledDialogTitle>Filter Requests</StyledDialogTitle>
      <StyledDivider />
      <DialogContent>
        <FieldStack>
          <Section>
            <FilterSectionLabel variant="caption" color="text.secondary">
              Sort by date
            </FilterSectionLabel>
            <ToggleButtonGroup
              value={draftSort}
              exclusive
              onChange={(_, v) => { if (v) setDraftSort(v) }}
              size="small"
              fullWidth
            >
              <StyledSortToggleButton value="latest">Latest first</StyledSortToggleButton>
              <StyledSortToggleButton value="oldest">Oldest first</StyledSortToggleButton>
            </ToggleButtonGroup>
          </Section>

          <Section>
            <FilterSectionLabel variant="caption" color="text.secondary">
              Status
            </FilterSectionLabel>
            <StatusChips>
              {ALL_STATUSES.map((s) => (
                <Chip
                  key={s}
                  label={STATUS_LABELS[s]}
                  onClick={() => toggleStatus(s)}
                  variant={draftStatuses.includes(s) ? 'filled' : 'outlined'}
                  color={draftStatuses.includes(s) ? 'primary' : 'default'}
                  size="small"
                  clickable
                />
              ))}
            </StatusChips>
          </Section>

          <Section>
            <FilterSectionLabel variant="caption" color="text.secondary">
              Requested roles
            </FilterSectionLabel>
            <Autocomplete
              multiple
              options={ALL_ROLES}
              value={draftRoles}
              onChange={(_, val) => setDraftRoles(val)}
              getOptionLabel={(r) => r.toLowerCase().replace(/_/g, '-')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={draftRoles.length === 0 ? 'Any role…' : ''}
                  size="small"
                />
              )}
              disableCloseOnSelect
            />
          </Section>
        </FieldStack>
      </DialogContent>
      <Divider />
      <StyledDialogActions>
        <Button size="small" color="inherit" onClick={handleClear} disabled={!isDirty}>
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
