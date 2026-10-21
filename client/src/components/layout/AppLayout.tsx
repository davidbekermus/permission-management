import {
  MainContent,
  StyledAppBar,
  LayoutToolbar,
  HomeButton,
  LogoutButton,
  NavigationDivider,
  ToolbarSpacer,
  Username,
} from "./AppLayout.style";
import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Outlet,
  useNavigate,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { getCurrentUsername, removeUserToken } from "@/app/auth/auth.utils";

const PAGE_TITLES: Record<string, string> = {
  "/app/home": "",
  "/app/stores": "Store Management",
  "/app/products": "Product Management",
  "/app/settings": "Permission Settings",
};

function getPageTitle(path: string): string {
  if (path.startsWith("/app/settings")) return "Permission Settings";
  return PAGE_TITLES[path] ?? "";
}

export const AppLayout = () => {
  const username = getCurrentUsername();
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { location } = useRouterState();
  const pageTitle = getPageTitle(location.pathname);

  const handleLogout = async () => {
    removeUserToken();
    queryClient.clear();
    await router.invalidate();
    await navigate({ to: "/login" });
  };

  return (
    <>
      <StyledAppBar position="static" elevation={0}>
        <LayoutToolbar variant="dense" disableGutters>
          <HomeButton
            color="secondary"
            startIcon={<HomeIcon fontSize="small" />}
            onClick={() => navigate({ to: "/app/home" })}
          >
            Home
          </HomeButton>

          {pageTitle && (
            <>
              <NavigationDivider orientation="vertical" flexItem />
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {pageTitle}
              </Typography>
            </>
          )}

          <ToolbarSpacer />

          {username && (
            <Username variant="body2" color="text.secondary">
              {username}
            </Username>
          )}
          <LogoutButton
            color="secondary"
            startIcon={<LogoutIcon fontSize="small" />}
            onClick={handleLogout}
          >
            Logout
          </LogoutButton>
        </LayoutToolbar>
      </StyledAppBar>

      <MainContent>
        <Outlet />
      </MainContent>
    </>
  );
};
