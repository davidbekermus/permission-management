import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
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
}

interface SubmissionForm {
  roles: Roles[]
  action: RoleSubmissionAction
}

const INITIAL_FORM: SubmissionForm = {
  roles: [],
  action: RoleSubmissionAction.ADDITION,
}

export function CreateRoleSubmissionDialog({ open, onClose }: CreateRoleSubmissionDialogProps) {
  const { enqueueSnackbar } = useSnackbar()
  const myRoles = getCurrentRoles()
  const userIsAnomalyAdmin = isAnomalyAdmin()
  const [form, setForm] = useState<SubmissionForm>(INITIAL_FORM)
  const { roles, action } = form
  const createSubmission = useCreateRoleSubmission()
  const availableRoles = action === RoleSubmissionAction.ADDITION
    ? filterRequestableRoles(ALL_ROLES, myRoles)
    : myRoles

  const handleClose = () => {
    setForm(INITIAL_FORM)
    createSubmission.reset()
    onClose()
  }

  const handleSubmit = () => {
    if (roles.length === 0) return
    createSubmission.mutate(
      { roles, action },
      {
        onSuccess: (createdSubmissions) => {
          enqueueSnackbar(
            `${createdSubmissions.length} permission ${createdSubmissions.length === 1 ? 'request' : 'requests'} submitted`,
            { variant: 'success' },
          )
          handleClose()
        },
      },
    )
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
          <ToggleButtonGroup
            value={action}
            exclusive
            fullWidth
            size="small"
            onChange={(_, value: RoleSubmissionAction | null) => {
              if (value) setForm({ roles: [], action: value })
            }}
            disabled={createSubmission.isPending}
          >
            <ToggleButton value={RoleSubmissionAction.ADDITION}>Add</ToggleButton>
            <ToggleButton value={RoleSubmissionAction.DELETION}>Delete</ToggleButton>
          </ToggleButtonGroup>

          {userIsAnomalyAdmin && action === RoleSubmissionAction.ADDITION ? (
            <Alert severity="info">
              You already have the highest level of access. No additional roles can be requested.
            </Alert>
          ) : (
            <Autocomplete
              multiple
              options={availableRoles}
              value={roles}
              onChange={(_, value) => setForm((current) => ({ ...current, roles: value }))}
              getOptionLabel={formatRole}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Roles to ${action === RoleSubmissionAction.ADDITION ? 'add' : 'delete'}`}
                  size="small"
                  helperText={availableRoles.length === 0
                    ? `No roles available to ${action === RoleSubmissionAction.ADDITION ? 'add' : 'delete'}`
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
