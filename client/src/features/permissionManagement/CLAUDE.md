# permissionManagement Feature

Admin UI for managing users and role submissions with role-based access control (RBAC).

## What's in this folder

```
permissionManagement/
├── users/                  # Users tab — list, filter, add user, assign/remove roles
│   ├── hooks/              # useUsers — TanStack Query wrapper
│   ├── services/           # usersApi — axios calls to GET/POST /users, PATCH /users/:id/roles
│   ├── *.style.tsx         # MUI styled components per file
│   └── types.ts            # User, UserRole types
├── roleSubmissions/     # Role Submissions tab — list, filter, approve/reject
│   ├── hooks/              # useRoleSubmissions — TanStack Query wrapper
│   ├── services/           # roleSubmissionsApi — axios calls to GET/PATCH /role-submissions
│   ├── *.style.tsx
│   └── types.ts            # PermissionRequest, RequestStatus types
├── hooks/
│   └── useDebounce.ts      # Generic debounce hook used by filter inputs
├── shared/
│   ├── types.ts            # Role enum shared across users + requests
│   └── DialogStyles.style.tsx  # Common MUI dialog layout styles
├── PermissionManagementPage.tsx        # Tabs container (Users | Role Submissions)
└── PermissionManagementPage.style.tsx
```

## Peer dependencies

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install @tanstack/react-query axios jwt-decode
```

## Wiring into your project

**HTTP client** — All `services/` files import `apiClient` from `@/app/api/axiosClient`. Replace that import with your own axios instance. The instance must:
- Set `Authorization: Bearer <token>` on every request
- Redirect to login on 401

**Token** — The feature reads the JWT from `localStorage.getItem('pm_token')`. Change the key in your project's constants file and update the import in `axiosClient`.

**Routing** — Mount `PermissionManagementPage` on any route that requires an admin role. No internal routing — it's a single page with tabs.

**React Query** — Wrap the feature (or your whole app) in a `QueryClientProvider`.

## Adding a new role

Update the `Role` enum in `shared/types.ts`. The pattern is `{FLOW}_ADMIN` / `{FLOW}_USER` (e.g. `STORE_ADMIN`, `STORE_USER`). No other changes needed in the frontend.

## Backend contract

Expects a NestJS backend with these endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | /users | List users (supports `?username=` search) |
| POST | /users | Add user directly (admin only) |
| PATCH | /users/:id/roles | Assign or remove roles |
| GET | /role-submissions | List role submissions (supports filters) |
| PATCH | /role-submissions/:id/approve | Approve one role submission |
| PATCH | /role-submissions/:id/reject | Reject one role submission |

See the `server/src/role-submissions/CLAUDE.md` for the backend integration guide.

