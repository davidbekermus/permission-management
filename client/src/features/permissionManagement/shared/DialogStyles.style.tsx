// Shared styled components used identically across all four dialogs
// (FilterDialog, CreateRoleSubmissionDialog, AddUserDialog).
// Import from here instead of redefining per-dialog.

import { styled } from '@mui/material/styles'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import DialogActions from '@mui/material/DialogActions'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export const StyledDialogTitle = styled(DialogTitle)({
  fontWeight: 600,
  paddingBottom: 0,
})

export const StyledDivider = styled(Divider)(({ theme }) => ({
  marginTop: theme.spacing(2),
}))

export const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  justifyContent: 'space-between',
}))

export const FieldStack = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
  paddingTop: theme.spacing(1),
}))

export const ButtonRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}))

export const FilterSectionLabel = styled(Typography)({
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontWeight: 600,
})
