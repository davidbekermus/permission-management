import { styled } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'

export const FilterSection = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  paddingTop: theme.spacing(0.5),
}))

export const StatusChips = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}))

export const StyledSortToggleButton = styled(ToggleButton)({
  textTransform: 'none',
})
