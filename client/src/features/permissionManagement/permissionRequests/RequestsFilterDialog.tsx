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
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import { ALL_ROLES, type Role } from '@/features/auth/types'
import type { OverallStatus } from './types'
import type { SortOrder } from '../users/FilterDialog'

const ALL_STATUSES: OverallStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_APPROVED']

const STATUS_LABELS: Record<OverallStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PARTIALLY_APPROVED: 'Partial',
}

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

const StatusChips = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}))

interface RequestsFilterDialogProps {
  open: boolean
  onClose: () => void
  appliedStatuses: OverallStatus[]
  appliedRoles: Role[]
  appliedSort: SortOrder
  onApply: (statuses: OverallStatus[], roles: Role[], sort: SortOrder) => void
}

export function RequestsFilterDialog({
  open, onClose, appliedStatuses, appliedRoles, appliedSort, onApply,
}: RequestsFilterDialogProps) {
  const [draftStatuses, setDraftStatuses] = useState<OverallStatus[]>(appliedStatuses)
  const [draftRoles, setDraftRoles] = useState<Role[]>(appliedRoles)
  const [draftSort, setDraftSort] = useState<SortOrder>(appliedSort)

  useEffect(() => {
    if (open) {
      setDraftStatuses(appliedStatuses)
      setDraftRoles(appliedRoles)
      setDraftSort(appliedSort)
    }
  }, [open, appliedStatuses, appliedRoles, appliedSort])

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
      <DialogTitle sx={{ fontWeight: 600, pb: 0 }}>Filter Requests</DialogTitle>
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
              Status
            </Typography>
            <StatusChips>
              {ALL_STATUSES.map((s) => (
                <Chip
                  key={s}
                  label={STATUS_LABELS[s]}
                  onClick={() => toggleStatus(s)}
                  variant={draftStatuses.includes(s) ? 'filled' : 'outlined'}
                  color={draftStatuses.includes(s) ? 'primary' : 'default'}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </StatusChips>
          </Section>

          <Section>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
            >
              Requested roles
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
