import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import TextField from '@mui/material/TextField'
import SearchIcon from '@mui/icons-material/Search'

export const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}))

export const Toolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  paddingBottom: theme.spacing(2.5),
  flexWrap: 'wrap',
}))

export const FlexSpacer = styled(Box)({
  flexGrow: 1,
})

export const ContentBox = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(2.5),
}))

export const ScreenReaderOnly = styled(Box)({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
})

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButton-root': {
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.875rem',
    padding: theme.spacing(0.5, 2),
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      '&:hover': { backgroundColor: theme.palette.primary.dark },
    },
  },
}))

interface FilterIconButtonStyledProps {
  $active: boolean
}

export const StyledFilterIconButton = styled(IconButton)<FilterIconButtonStyledProps>(
  ({ theme, $active }) => ({
    border: '1px solid',
    borderColor: $active ? theme.palette.primary.main : theme.palette.divider,
    borderRadius: theme.shape.borderRadius,
    color: $active ? theme.palette.primary.main : theme.palette.text.secondary,
    padding: theme.spacing(0.625),
  }),
)

export const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    fontSize: '0.6rem',
    minWidth: theme.spacing(2),
    height: theme.spacing(2),
  },
}))

export const SearchField = styled(TextField)(({ theme }) => ({
  width: 260,
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}))

export const SearchAdornmentIcon = styled(SearchIcon)(({ theme }) => ({
  color: theme.palette.text.disabled,
}))
