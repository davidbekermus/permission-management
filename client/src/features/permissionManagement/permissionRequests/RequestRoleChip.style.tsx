import { styled } from '@mui/material/styles'
import Chip from '@mui/material/Chip'

export const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: 6,
  fontSize: '0.75rem',
  height: 24,
  margin: theme.spacing(0.25),
}))

export const StyledOverallStatusChip = styled(Chip)({
  textTransform: 'capitalize',
})
