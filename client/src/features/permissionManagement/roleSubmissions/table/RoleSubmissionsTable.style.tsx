import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import TableRow from '@mui/material/TableRow'

export const  RequestTableRow = styled(TableRow)(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  '& .MuiTableCell-root, & .MuiTypography-root, & .MuiChip-root, & .MuiButton-root': {
    fontSize: 'inherit',
  },
}))

export const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridAutoFlow: 'column',
  gridAutoColumns: '1fr',
  gap: theme.spacing(1),
}))

export const RequestsContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
})

export const ScopeFiltersRow = styled(Stack)(({ theme }) => ({ marginBottom: theme.spacing(2) }))
