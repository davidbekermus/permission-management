import { styled } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

export const MainContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  minHeight: 'calc(100dvh - 49px)',
}))

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
}))

export const LayoutToolbar = styled(Toolbar)(({ theme }) => ({ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2), minHeight: 48 }))
export const HomeButton = styled(Button)(({ theme }) => ({ textTransform: 'none', color: theme.palette.text.secondary, minWidth: 0 }))
export const LogoutButton = styled(Button)(({ theme }) => ({ textTransform: 'none', color: theme.palette.text.secondary }))
export const NavigationDivider = styled(Divider)(({ theme }) => ({ marginLeft: theme.spacing(1.5), marginRight: theme.spacing(1.5), marginTop: theme.spacing(1), marginBottom: theme.spacing(1) }))
export const ToolbarSpacer = styled(Box)({ flexGrow: 1 })
export const Username = styled(Typography)(({ theme }) => ({ marginRight: theme.spacing(2) }))
