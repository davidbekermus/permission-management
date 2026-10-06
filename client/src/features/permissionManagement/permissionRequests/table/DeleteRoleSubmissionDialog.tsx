import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { formatRole } from '../../shared/role.utils'
import type { Roles } from '../../shared/types'
import { StyledDialogTitle, StyledDivider, StyledDialogActions } from '../../shared/DialogStyles.style'

interface DeleteRoleSubmissionDialogProps {
  open: boolean
  role: Roles
  isPending: boolean
  onClose: () => void
  onConfirm: () => void
}

export const DeleteRoleSubmissionDialog = ({
  open,
  role,
  isPending,
  onClose,
  onConfirm,
}: DeleteRoleSubmissionDialogProps) => {
  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <StyledDialogTitle>Delete permission request?</StyledDialogTitle>
      <StyledDivider />
      <DialogContent>
        <Typography variant="body2">
          This will permanently delete your pending request for {formatRole(role)}.
        </Typography>
      </DialogContent>
      <Divider />
      <StyledDialogActions>
        <Button color="inherit" onClick={onClose} disabled={isPending}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={isPending}>
          {isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
