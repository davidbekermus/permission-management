import { styled } from '@mui/material/styles'
import Chip from '@mui/material/Chip'

export const StyledChip = styled(Chip)(({ theme }) => ({
  fontSize: theme.typography.caption.fontSize,
}))
