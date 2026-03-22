import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'

export const AssignRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  marginTop: theme.spacing(1),
}))

export const AssignRowWrap = styled(AssignRow)({
  flexWrap: 'wrap',
})

export const EmptyRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
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

export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: theme.spacing(20),
}))

interface ManageRolesIconButtonProps {
  $canAct: boolean
}

export const ManageRolesIconButton = styled(IconButton)<ManageRolesIconButtonProps>(
  ({ theme, $canAct }) => ({
    color: $canAct ? theme.palette.text.secondary : theme.palette.action.disabled,
  }),
)
