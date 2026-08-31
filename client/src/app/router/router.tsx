import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router'
import { LoginPage } from '@/features/auth/LoginPage'
import { AppLayout } from '@/components/layout/AppLayout'
import { PermissionManagementPage } from '@/features/permissionManagement/PermissionManagementPage'
import { StoresPage } from '@/features/stores/StoresPage'
import { ProductsPage } from '@/features/products/ProductsPage'
import { HomePage } from '@/features/home/HomePage'
import { canReadPermissionManagement, isAuthenticated } from '@/app/auth/auth.utils'

const rootRoute = createRootRoute({ component: Outlet })

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: AppLayout,
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: '/login' })
  },
})

const homeRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/home',
  component: HomePage,
})

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/settings',
  component: Outlet,
})

const settingsIndexRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: canReadPermissionManagement()
        ? '/app/settings/users'
        : '/app/settings/permission-requests',
    })
  },
})

const settingsUsersRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/users',
  beforeLoad: () => {
    if (!canReadPermissionManagement()) {
      throw redirect({ to: '/app/settings/permission-requests' })
    }
  },
  component: () => <PermissionManagementPage view="users" />,
})

const settingsPermissionRequestsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/permission-requests',
  component: () => <PermissionManagementPage view="submissions" />,
})

const storesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/stores',
  component: StoresPage,
})

const productsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/products',
  component: ProductsPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: isAuthenticated() ? '/app/home' : '/login',
    })
  },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appRoute.addChildren([
    homeRoute,
    settingsRoute.addChildren([
      settingsIndexRoute,
      settingsUsersRoute,
      settingsPermissionRequestsRoute,
    ]),
    storesRoute,
    productsRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
