import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import HomeIcon from '@mui/icons-material/Home'
import LogoutIcon from '@mui/icons-material/Logout'
import { Outlet, useNavigate, useRouter, useRouterState } from '@tanstack/react-router'
import { getCurrentUsername, removeUserToken } from '@/app/auth/auth.utils'

const MainContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  minHeight: 'calc(100vh - 48px)',
}))

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
}))

const PAGE_TITLES: Record<string, string> = {
  '/app/home': '',
  '/app/stores': 'Store Management',
  '/app/products': 'Product Management',
  '/app/settings': 'Permission Settings',
}

function getPageTitle(path: string): string {
  if (path.startsWith('/app/settings')) return 'Permission Settings'
  return PAGE_TITLES[path] ?? ''
}

export function AppLayout() {
  const username = getCurrentUsername()
  const navigate = useNavigate()
  const router = useRouter()
  const { location } = useRouterState()
  const pageTitle = getPageTitle(location.pathname)

  const handleLogout = async () => {
    removeUserToken()
    await router.invalidate()
    await navigate({ to: '/login' })
  }

  return (
    <>
      <StyledAppBar position="static" elevation={0}>
        <Toolbar variant="dense" disableGutters sx={{ px: 2, minHeight: 48 }}>
          <Button
            startIcon={<HomeIcon fontSize="small" />}
            onClick={() => navigate({ to: '/app/home' })}
            sx={{ textTransform: 'none', color: 'text.secondary', minWidth: 0 }}
          >
            Home
          </Button>

          {pageTitle && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 1.5, my: 1 }} />
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {pageTitle}
              </Typography>
            </>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {username && (
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              {username}
            </Typography>
          )}
          <Button
            startIcon={<LogoutIcon fontSize="small" />}
            onClick={handleLogout}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Logout
          </Button>
        </Toolbar>
      </StyledAppBar>

      <MainContent>
        <Outlet />
      </MainContent>
    </>
  )
}
