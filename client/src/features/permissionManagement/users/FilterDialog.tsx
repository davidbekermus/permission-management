import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import { ALL_ROLES, type Role } from '@/features/auth/types'

export type SortOrder = 'latest' | 'oldest'

const Section = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  paddingTop: theme.spacing(0.5),
}))

const FieldStack = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
  paddingTop: theme.spacing(1),
}))

interface FilterDialogProps {
  open: boolean
  onClose: () => void
  appliedRoles: Role[]
  appliedSort: SortOrder
  onApply: (roles: Role[], sort: SortOrder) => void
}

export function FilterDialog({ open, onClose, appliedRoles, appliedSort, onApply }: FilterDialogProps) {
  const [draftRoles, setDraftRoles] = useState<Role[]>(appliedRoles)
  const [draftSort, setDraftSort] = useState<SortOrder>(appliedSort)

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

  const isDirty = draftRoles.length > 0 || draftSort !== 'latest'

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 600, pb: 0 }}>Filter Users</DialogTitle>
      <Divider sx={{ mt: 2 }} />
      <DialogContent>
        <FieldStack>
          <Section>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
            >
              Sort by date
            </Typography>
            <ToggleButtonGroup
              value={draftSort}
              exclusive
              onChange={(_, v) => { if (v) setDraftSort(v) }}
              size="small"
              fullWidth
            >
              <ToggleButton value="latest" sx={{ textTransform: 'none', flex: 1 }}>Latest first</ToggleButton>
              <ToggleButton value="oldest" sx={{ textTransform: 'none', flex: 1 }}>Oldest first</ToggleButton>
            </ToggleButtonGroup>
          </Section>

          <Section>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
            >
              Roles
            </Typography>
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
      <DialogActions sx={{ px: 3, py: 1.5, justifyContent: 'space-between' }}>
        <Button size="small" color="inherit" onClick={handleClear} disabled={!isDirty}>
          Clear all
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleApply}>Apply</Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}
