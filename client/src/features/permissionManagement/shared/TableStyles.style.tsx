import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'

export const EmptyRow = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
}))

export const EmptyTableCell = styled(TableCell)({
  border: 0,
  padding: 0,
})
