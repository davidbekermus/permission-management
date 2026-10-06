import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { formatRole } from '../../shared/role.utils'
import type { Roles } from '../../shared/types'

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
    <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="xs">
      <DialogTitle>Delete permission request?</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          This will permanently delete your pending request for {formatRole(role)}.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose} disabled={isPending}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={isPending}>
          {isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
