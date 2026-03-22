import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router'
import { LoginPage } from '@/features/auth/LoginPage'
import { AppLayout } from '@/components/layout/AppLayout'
import { PermissionManagementPage } from '@/features/permissionManagement'
import { StoresPage } from '@/features/stores/StoresPage'
import { ProductsPage } from '@/features/products/ProductsPage'
import { HomePage } from '@/features/home/HomePage'

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
    if (!localStorage.getItem('pm_token')) throw redirect({ to: '/login' })
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
  component: PermissionManagementPage,
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
      to: localStorage.getItem('pm_token') ? '/app/home' : '/login',
    })
  },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appRoute.addChildren([homeRoute, settingsRoute, storesRoute, productsRoute]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
