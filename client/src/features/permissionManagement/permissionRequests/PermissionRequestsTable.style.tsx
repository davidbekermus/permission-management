import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

export const EmptyRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
}))

export const ReviewPanel = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.75),
  marginTop: theme.spacing(1.5),
  paddingTop: theme.spacing(1.5),
  borderTop: `1px solid ${theme.palette.divider}`,
}))

export const ReviewRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}))

export const RoleChipsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
}))

export const EmptyTableCell = styled(TableCell)({
  border: 0,
  padding: 0,
})

export const StyledTableContainer = styled(TableContainer)({
  overflowX: 'auto',
})

export const ReviewRoleLabel = styled(Typography)(({ theme }) => ({
  minWidth: theme.spacing(15),
  color: theme.palette.text.secondary,
}))

export const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: theme.spacing(10),
}))

export const DoneButtonWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
}))

interface ReviewIconButtonProps {
  $canAct: boolean
}

export const ReviewIconButton = styled(IconButton)<ReviewIconButtonProps>(
  ({ theme, $canAct }) => ({
    color: $canAct ? theme.palette.text.secondary : theme.palette.action.disabled,
  }),
)
