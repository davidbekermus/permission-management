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
import type { RoleSubmissionStatus } from './types'
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
} from './RoleSubmissionsFilterDialog.style'

interface RoleSubmissionsFilterDialogProps {
  open: boolean
  onClose: () => void
  appliedStatuses: RoleSubmissionStatus[]
  appliedRoles: Role[]
  appliedSort: SortOrder
  onApply: (statuses: RoleSubmissionStatus[], roles: Role[], sort: SortOrder) => void
}

export function RoleSubmissionsFilterDialog({
  open, onClose, appliedStatuses, appliedRoles, appliedSort, onApply,
}: RoleSubmissionsFilterDialogProps) {
  const [draftStatuses, setDraftStatuses] = useState<RoleSubmissionStatus[]>(appliedStatuses)
  const [draftRoles, setDraftRoles] = useState<Role[]>(appliedRoles)
  const [draftSort, setDraftSort] = useState<SortOrder>(appliedSort)

  useEffect(() => {
    if (open) {
      setDraftStatuses(appliedStatuses)
      setDraftRoles(appliedRoles)
      setDraftSort(appliedSort)
    }
  }, [open, appliedStatuses, appliedRoles, appliedSort])

  const toggleStatus = (status: RoleSubmissionStatus) => {
    setDraftStatuses((prev) =>
      prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status],
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
      <StyledDialogTitle>Filter Permission Requests</StyledDialogTitle>
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
              onChange={(_, value) => { if (value) setDraftSort(value) }}
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
              {ALL_STATUSES.map((status) => (
                <Chip
                  key={status}
                  label={STATUS_LABELS[status]}
                  onClick={() => toggleStatus(status)}
                  variant={draftStatuses.includes(status) ? 'filled' : 'outlined'}
                  color={draftStatuses.includes(status) ? 'primary' : 'default'}
                  size="small"
                  clickable
                />
              ))}
            </StatusChips>
          </Section>

          <Section>
            <FilterSectionLabel variant="caption" color="text.secondary">
              Roles
            </FilterSectionLabel>
            <Autocomplete
              multiple
              options={ALL_ROLES}
              value={draftRoles}
              onChange={(_, value) => setDraftRoles(value)}
              getOptionLabel={(role) => role.toLowerCase().replace(/_/g, '-')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={draftRoles.length === 0 ? 'Any role...' : ''}
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
