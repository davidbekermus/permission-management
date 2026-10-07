import { styled } from '@mui/material/styles'
import Tabs, { tabsClasses } from '@mui/material/Tabs'
import { tabClasses } from '@mui/material/Tab'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'

export const PageWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
  padding: theme.spacing(3),
}))

export const Toolbar = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
}))

export const ToolbarActions = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
}))

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: theme.spacing(5),
  [`& .${tabsClasses.indicator}`]: {
    height: theme.spacing(0.375),
    borderRadius: `${theme.spacing(0.375)} ${theme.spacing(0.375)} 0 0`,
  },
  [`& .${tabClasses.root}`]: {
    minHeight: theme.spacing(5),
    padding: theme.spacing(0.75, 2),
  },
  [`& .${tabClasses.root}.${tabClasses.selected}`]: {
    fontWeight: theme.typography.fontWeightBold,
  },
}))

interface FilterIconButtonStyledProps {
  $active: boolean
}

export const StyledFilterIconButton = styled(IconButton, {
  shouldForwardProp: (prop) =>
    prop !== '$active' && prop !== 'ownerState' && prop !== 'theme' && prop !== 'sx' && prop !== 'as',
})<FilterIconButtonStyledProps>(
  ({ theme, $active }) => ({
    border: '1px solid',
    borderColor: $active ? theme.palette.primary.main : theme.palette.divider,
    borderRadius: theme.shape.borderRadius,
    color: $active ? theme.palette.primary.main : theme.palette.text.secondary,
  }),
)

export const SearchField = styled(TextField)(({ theme }) => ({
  width: theme.spacing(32),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}))
