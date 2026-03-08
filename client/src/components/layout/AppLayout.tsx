import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import StoreIcon from '@mui/icons-material/Store'
import InventoryIcon from '@mui/icons-material/Inventory'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { useAuth } from '@/app/providers/AuthProvider'

const DRAWER_WIDTH = 220

const LayoutRoot = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
})

const StyledDrawer = styled(Drawer)({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
})

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}))

const NavBrand = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1),
}))

const NavFooter = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}))

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  show: boolean
}

export function AppLayout() {
  const { roles, isAnomalyAdmin, isFlowAdmin, username, logout } = useAuth()
  const navigate = useNavigate()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const navItems: NavItem[] = [
    {
      label: 'Stores',
      path: '/app/stores',
      icon: <StoreIcon fontSize="small" />,
      show: isFlowAdmin('STORE') || roles.includes('STORE_USER') || isAnomalyAdmin,
    },
    {
      label: 'Products',
      path: '/app/products',
      icon: <InventoryIcon fontSize="small" />,
      show: isFlowAdmin('PRODUCT') || roles.includes('PRODUCT_USER') || isAnomalyAdmin,
    },
    {
      label: 'Settings',
      path: '/app/settings',
      icon: <SettingsIcon fontSize="small" />,
      show: true,
    },
  ]

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <LayoutRoot>
      <StyledDrawer variant="permanent">
        <NavBrand>
          <Typography variant="subtitle1" fontWeight={700} color="primary">
            PermManage
          </Typography>
          {username && (
            <Typography variant="caption" color="text.secondary" display="block">
              {username}
            </Typography>
          )}
        </NavBrand>
        <Divider />
        <List dense>
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <ListItemButton
                key={item.path}
                selected={currentPath === item.path}
                onClick={() => navigate({ to: item.path })}
                sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem' }} />
              </ListItemButton>
            ))}
        </List>
        <NavFooter>
          <Button
            fullWidth
            variant="text"
            color="inherit"
            startIcon={<LogoutIcon fontSize="small" />}
            onClick={handleLogout}
            sx={{ justifyContent: 'flex-start', color: 'text.secondary', textTransform: 'none' }}
          >
            Logout
          </Button>
        </NavFooter>
      </StyledDrawer>
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutRoot>
  )
}
