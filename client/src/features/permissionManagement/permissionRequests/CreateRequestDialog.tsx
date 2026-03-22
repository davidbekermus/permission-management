import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { useCreatePermissionRequest } from './hooks/usePermissionRequests'
import { useAuth } from '@/app/providers/AuthProvider'
import { ALL_ROLES, filterRequestableRoles, type Role } from '@/features/auth/types'
import { StyledDialogTitle, StyledDivider, StyledDialogActions, FieldStack } from '../shared/DialogStyles.style'

interface CreateRequestDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateRequestDialog({ open, onClose }: CreateRequestDialogProps) {
  const { roles: myRoles, isAnomalyAdmin } = useAuth()
  const [selected, setSelected] = useState<Role[]>([])
  const createRequest = useCreatePermissionRequest()

  // filterRequestableRoles strips roles the user already holds, plus FLOW_USER
  // if they already have FLOW_ADMIN (redundant — admin implies user privileges)
  const availableRoles = filterRequestableRoles(ALL_ROLES, myRoles)

  const handleClose = () => {
    setSelected([])
    // Reset clears error state so re-opening shows a clean form
    createRequest.reset()
    onClose()
  }

  const handleSubmit = () => {
    if (selected.length === 0) return
    createRequest.mutate(selected, { onSuccess: handleClose })
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <StyledDialogTitle>Request Permission</StyledDialogTitle>
      <StyledDivider />
      <DialogContent>
        <FieldStack>
          {createRequest.isError && (
            <Alert severity="error">Failed to submit request. Please try again.</Alert>
          )}
          {/* ANOMALY_ADMIN already has full access — no roles left to request */}
          {isAnomalyAdmin ? (
            <Alert severity="info">
              You already have the highest level of access. No additional roles can be requested.
            </Alert>
          ) : (
            <Autocomplete
              multiple
              options={availableRoles}
              value={selected}
              onChange={(_, val) => setSelected(val)}
              getOptionLabel={(r) => r.toLowerCase().replace(/_/g, '-')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Roles to request"
                  size="small"
                  helperText="At least one role required"
                />
              )}
              disabled={createRequest.isPending}
            />
          )}
        </FieldStack>
      </DialogContent>
      <Divider />
      <StyledDialogActions>
        <Button onClick={handleClose} color="inherit" disabled={createRequest.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={selected.length === 0 || createRequest.isPending}
          startIcon={createRequest.isPending ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {createRequest.isPending ? 'Submitting…' : 'Submit request'}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
