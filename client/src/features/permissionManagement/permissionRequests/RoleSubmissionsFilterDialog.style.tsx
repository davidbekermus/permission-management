import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import ToggleButton from '@mui/material/ToggleButton'

export { StyledDialogTitle, StyledDivider, StyledDialogActions, FieldStack, ButtonRow, FilterSectionLabel } from '../shared/DialogStyles.style'

export const Section = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  paddingTop: theme.spacing(0.5),
}))

export const StatusChips = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}))

export const StyledSortToggleButton = styled(ToggleButton)({
  textTransform: 'none',
  flex: 1,
})
