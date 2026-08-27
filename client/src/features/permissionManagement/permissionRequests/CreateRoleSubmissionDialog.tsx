import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { useCreateRoleSubmission } from './hooks/useRoleSubmissions'
import { useAuth } from '@/app/providers/AuthProvider'
import { ALL_ROLES, filterRequestableRoles, type Role } from '@/features/auth/types'
import { StyledDialogTitle, StyledDivider, StyledDialogActions, FieldStack } from '../shared/DialogStyles.style'

interface CreateRoleSubmissionDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateRoleSubmissionDialog({ open, onClose }: CreateRoleSubmissionDialogProps) {
  const { roles: myRoles, isAnomalyAdmin } = useAuth()
  const [selected, setSelected] = useState<Role[]>([])
  const createSubmission = useCreateRoleSubmission()
  const availableRoles = filterRequestableRoles(ALL_ROLES, myRoles)

  const handleClose = () => {
    setSelected([])
    createSubmission.reset()
    onClose()
  }

  const handleSubmit = () => {
    if (selected.length === 0) return
    createSubmission.mutate(selected, { onSuccess: handleClose })
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <StyledDialogTitle>Request Permission</StyledDialogTitle>
      <StyledDivider />
      <DialogContent>
        <FieldStack>
          {createSubmission.isError && (
            <Alert severity="error">Failed to submit request. Please try again.</Alert>
          )}
          {isAnomalyAdmin ? (
            <Alert severity="info">
              You already have the highest level of access. No additional roles can be requested.
            </Alert>
          ) : (
            <Autocomplete
              multiple
              options={availableRoles}
              value={selected}
              onChange={(_, value) => setSelected(value)}
              getOptionLabel={(role) => role.toLowerCase().replace(/_/g, '-')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Roles to request"
                  size="small"
                  helperText="Each selected role creates one submission"
                />
              )}
              disabled={createSubmission.isPending}
            />
          )}
        </FieldStack>
      </DialogContent>
      <Divider />
      <StyledDialogActions>
        <Button onClick={handleClose} color="inherit" disabled={createSubmission.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={selected.length === 0 || createSubmission.isPending}
          startIcon={createSubmission.isPending ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {createSubmission.isPending ? 'Submitting...' : 'Submit request'}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
