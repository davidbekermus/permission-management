import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Autocomplete from '@mui/material/Autocomplete'
import { DialogTextField, DialogOptionsPaper, renderDialogRoleOption } from '../shared/DialogFields.style'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import DialogTitle from '@mui/material/DialogTitle'
import CircularProgress from '@mui/material/CircularProgress'
import type { Roles } from '../shared/types'
import { formatRole } from '../shared/role.utils'
import { StyledDialogActions, FieldStack } from '../shared/DialogStyles.style'

interface CreateRoleSubmissionDialogProps {
  open: boolean
  onClose: () => void
  availableRoles: Roles[]
  hasHighestAccess: boolean
  isPending: boolean
  onSubmit: (roles: Roles[]) => Promise<boolean>
}

export const CreateRoleSubmissionDialog = ({ open, onClose, availableRoles, hasHighestAccess, isPending, onSubmit }: CreateRoleSubmissionDialogProps) => {
  const [roles, setRoles] = useState<Roles[]>([])

  const handleClose = () => {
    setRoles([])
    onClose()
  }

  const handleSubmit = async () => {
    if (roles.length === 0 || isPending) return
    if (await onSubmit(roles)) handleClose()
  }

  return (
    <Dialog open={open} onClose={isPending ? undefined : handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Request Permission</DialogTitle>
      <DialogContent dividers>
        <FieldStack>
          {hasHighestAccess ? (
            <Alert severity="info" sx={{ color: 'primary.main', '& .MuiAlert-icon': { color: 'primary.main' } }}>
              You already have the highest level of access. No additional roles can be requested.
            </Alert>
          ) : (
            <Autocomplete
              multiple
              options={availableRoles}
              value={roles}
              onChange={(_, value) => setRoles(value)}
              getOptionLabel={formatRole}
              PaperComponent={DialogOptionsPaper}
              renderOption={renderDialogRoleOption}
              renderInput={(params) => (
                <DialogTextField
                  {...params}
                  label="Roles to add"
                  size="small"
                  helperText={availableRoles.length === 0
                    ? 'No roles available to add'
                    : 'Each selected role creates one submission'}
                />
              )}
              disabled={isPending}
            />
          )}
        </FieldStack>
      </DialogContent>
      <StyledDialogActions disableSpacing>
        <Button onClick={handleClose} color="inherit" disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={roles.length === 0 || isPending}
          startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {isPending ? 'Submitting...' : 'Submit request'}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
