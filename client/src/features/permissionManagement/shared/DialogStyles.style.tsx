// Shared styled components used identically across all four dialogs
// (FilterDialog, CreateRoleSubmissionDialog, DeleteRoleSubmissionDialog, AddUserDialog).
// Import from here instead of redefining per-dialog.

import { styled } from '@mui/material/styles'
import DialogActions from '@mui/material/DialogActions'

export const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  gap: theme.spacing(1),
  justifyContent: 'space-between',
}))

export const FieldStack = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
}))

export const ButtonRow = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}))
