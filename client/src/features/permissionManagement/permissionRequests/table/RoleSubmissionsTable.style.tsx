import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

export const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridAutoFlow: 'column',
  gridAutoColumns: '1fr',
  gap: theme.spacing(1),
}))
