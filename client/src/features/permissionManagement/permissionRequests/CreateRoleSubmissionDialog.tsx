import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { useSnackbar } from 'notistack'
import { useCreateRoleSubmission } from './hooks/useRoleSubmissions'
import { getCurrentRoles, isAnomalyAdmin } from '@/app/auth/auth.utils'
import { ALL_ROLES, type Roles } from '../shared/types'
import { filterRequestableRoles, formatRole } from '../shared/role.utils'
import { StyledDialogTitle, StyledDivider, StyledDialogActions, FieldStack } from '../shared/DialogStyles.style'
import { RoleSubmissionAction } from './types'

interface CreateRoleSubmissionDialogProps {
  open: boolean
  onClose: () => void
  onSubmitted: () => void
}

export const CreateRoleSubmissionDialog = ({ open, onClose, onSubmitted }: CreateRoleSubmissionDialogProps) => {
  const { enqueueSnackbar } = useSnackbar()
  const myRoles = getCurrentRoles()
  const userIsAnomalyAdmin = isAnomalyAdmin()
  const [roles, setRoles] = useState<Roles[]>([])
  const createSubmission = useCreateRoleSubmission()
  const availableRoles = filterRequestableRoles(ALL_ROLES, myRoles)

  const handleClose = () => {
    setRoles([])
    createSubmission.reset()
    onClose()
  }

  const handleSubmit = () => {
    if (roles.length === 0) return
    createSubmission.mutate(
      { roles, action: RoleSubmissionAction.ADDITION },
      {
        onSuccess: (createdSubmissions) => {
          enqueueSnackbar(
            `${createdSubmissions.length} permission ${createdSubmissions.length === 1 ? 'request' : 'requests'} submitted`,
            { variant: 'success' },
          )
          handleClose()
          onSubmitted()
        },
        onError: () => enqueueSnackbar('Failed to submit permission request', { variant: 'error' }),
      },
    )
  }

  return (
    <Dialog open={open} onClose={createSubmission.isPending ? undefined : handleClose} fullWidth maxWidth="xs">
      <StyledDialogTitle>Request Permission</StyledDialogTitle>
      <StyledDivider />
      <DialogContent>
        <FieldStack>
          {createSubmission.isError && (
            <Alert severity="error">Failed to submit request. Please try again.</Alert>
          )}
          {userIsAnomalyAdmin ? (
            <Alert severity="info">
              You already have the highest level of access. No additional roles can be requested.
            </Alert>
          ) : (
            <Autocomplete
              multiple
              options={availableRoles}
              value={roles}
              onChange={(_, value) => setRoles(value)}
              getOptionLabel={formatRole}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Roles to add"
                  size="small"
                  helperText={availableRoles.length === 0
                    ? 'No roles available to add'
                    : 'Each selected role creates one submission'}
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
          disabled={roles.length === 0 || createSubmission.isPending}
          startIcon={createSubmission.isPending ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {createSubmission.isPending ? 'Submitting...' : 'Submit request'}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
