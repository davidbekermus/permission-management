import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import type { Role } from '../shared/roles.types'
import type { SortOrder } from '../shared/types'
import {
  StyledDialogTitle,
  StyledDivider,
  StyledDialogActions,
  FieldStack,
  ButtonRow,
  FilterSectionLabel,
  Section,
  StyledSortToggleButton,
} from './FilterDialog.style'

interface FilterDialogProps {
  open: boolean
  onClose: () => void
  appliedRoles: Role[]
  appliedSort: SortOrder
  roleOptions: Role[]
  onApply: (roles: Role[], sort: SortOrder) => void
}

// Draft state pattern: edits live in local draft state and are only committed to the
// parent when Apply is clicked. Cancelling or closing discards all in-progress changes.
export function FilterDialog({ open, onClose, appliedRoles, appliedSort, roleOptions, onApply }: FilterDialogProps) {
  const [draftRoles, setDraftRoles] = useState<Role[]>(appliedRoles)
  const [draftSort, setDraftSort] = useState<SortOrder>(appliedSort)

  // Re-sync draft with current applied values each time the dialog opens.
  // Without this, stale draft state would show after the parent clears filters externally.
  useEffect(() => {
    if (open) {
      setDraftRoles(appliedRoles)
      setDraftSort(appliedSort)
    }
  }, [open, appliedRoles, appliedSort])

  const handleApply = () => {
    onApply(draftRoles, draftSort)
    onClose()
  }

  const handleClear = () => {
    setDraftRoles([])
    setDraftSort('latest')
  }

  // isDirty gates the "Clear all" button — no point clearing when nothing is set
  const isDirty = draftRoles.length > 0 || draftSort !== 'latest'

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <StyledDialogTitle>Filter Users</StyledDialogTitle>
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
              Roles
            </FilterSectionLabel>
            <Autocomplete
              multiple
              options={roleOptions}
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
