import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { LoginPage } from "@/features/auth/LoginPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { PermissionManagementPage } from "@/features/permissionManagement/permissionManagementHost/PermissionManagementPage";
import type { PermissionManagementView } from "@/features/permissionManagement/permissionManagementUi/PermissionManagementLayout";
import { StoresPage } from "@/features/stores/StoresPage";
import { ProductsPage } from "@/features/products/ProductsPage";
import { HomePage } from "@/features/home/HomePage";
import {
  canReadPermissionManagement,
  isAuthenticated,
} from "@/app/auth/auth.utils";

const ROUTE_PATHS = {
  settingsPermissionRequests: "/app/settings/permission-requests",
  settingsUsers: "/app/settings/users",
  appHome: "/app/home",
  permissionRequests: "/permission-requests",
  settings: "/settings",
  products: "/products",
  stores: "/stores",
  users: "/users",
  login: "/login",
  home: "/home",
  app: "/app",
  root: "/",
} as const;

const rootRoute = createRootRoute({ component: Outlet });

const PermissionManagementRoute = () => {
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });
  const view: PermissionManagementView = pathname.endsWith(ROUTE_PATHS.users)
    ? "users"
    : "submissions";

  const handleViewChange = (nextView: PermissionManagementView) => {
    navigate({
      to:
        nextView === "users"
          ? ROUTE_PATHS.settingsUsers
          : ROUTE_PATHS.settingsPermissionRequests,
    });
  };

  return (
    <PermissionManagementPage view={view} onViewChange={handleViewChange} />
  );
};

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.login,
  component: LoginPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.app,
  component: AppLayout,
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: ROUTE_PATHS.login });
  },
});

const homeRoute = createRoute({
  getParentRoute: () => appRoute,
  path: ROUTE_PATHS.home,
  component: HomePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: ROUTE_PATHS.settings,
  component: PermissionManagementRoute,
});

const settingsIndexRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: ROUTE_PATHS.root,
  beforeLoad: () => {
    throw redirect({
      to: canReadPermissionManagement()
        ? ROUTE_PATHS.settingsUsers
        : ROUTE_PATHS.settingsPermissionRequests,
    });
  },
});

const settingsUsersRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: ROUTE_PATHS.users,
  beforeLoad: () => {
    if (!canReadPermissionManagement()) {
      throw redirect({ to: ROUTE_PATHS.settingsPermissionRequests });
    }
  },
  component: () => null,
});

const settingsPermissionRequestsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: ROUTE_PATHS.permissionRequests,
  component: () => null,
});

const storesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: ROUTE_PATHS.stores,
  component: StoresPage,
});

const productsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: ROUTE_PATHS.products,
  component: ProductsPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.root,
  beforeLoad: () => {
    throw redirect({
      to: isAuthenticated() ? ROUTE_PATHS.appHome : ROUTE_PATHS.login,
    });
  },
});

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
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
