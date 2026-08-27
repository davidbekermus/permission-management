import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Button from '@mui/material/Button'

export const EmptyRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
}))

export const EmptyTableCell = styled(TableCell)({
  border: 0,
  padding: 0,
})

export const StyledTableContainer = styled(TableContainer)({
  overflowX: 'auto',
})

export const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: theme.spacing(10),
}))
