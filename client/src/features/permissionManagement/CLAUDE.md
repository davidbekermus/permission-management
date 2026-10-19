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

**Routing** — Mount `PermissionManagementPage` with a `view` (`'users'` or `'submissions'`) and an `onViewChange` callback. The host route layer owns navigation and maps view changes to its routes. The page restricts the users view to admins.

**React Query** — Wrap the feature (or your whole app) in a `QueryClientProvider`.

## Adding a new role

Update the `Role` enum in `shared/types.ts`. The pattern is `{FLOW}_ADMIN` / `{FLOW}_USER` (e.g. `STORE_ADMIN`, `STORE_USER`). No other changes needed in the frontend.

## Backend contract

Expects a NestJS backend with these endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | /users | List users (supports `?username=` search) |
| POST | /users | Create one or many users with `{ usernames: string[], roles: Role[] }` (admin only); returns created users, skipping existing usernames |
| PATCH | /users/:id/roles | Assign or remove roles |
| GET | /role-submissions | List role submissions (supports filters) |
| PATCH | /role-submissions/:id/approve | Approve one role submission |
| PATCH | /role-submissions/:id/reject | Reject one role submission |

See the `server/src/role-submissions/CLAUDE.md` for the backend integration guide.


## Container and UI boundaries

`users/hooks/useUsersView.ts` and
`roleSubmissions/hooks/useRoleSubmissionsView.ts` are the main host integration
points. They own queries, mutations, authentication/permission checks, filters,
row preparation, dialog visibility, and success/error notifications. Adapt these
view hooks to the target project's hooks and auth helpers. API services and shared
types may also need changes if the target backend has a different contract.

`UsersView` and `PermissionRequestsView` call their view hook and compose the
UI using its grouped `filters`, `table`, and dialog props. They contain no direct
API/query/auth/notification logic. View hooks return plain UI props rather than
exposing query or mutation objects.

Tables, rows, cells, and create dialogs receive data, permission flags, pending
state, and callbacks through props. They do not import API services, query hooks,
auth helpers, or notification providers. Local form values, editing state, menus,
and confirmation dialogs stay inside the UI components.

Mutation callbacks that return `Promise<boolean>` return `true` after success and
`false` after a handled failure. Forms/editors close or reset only on success.
The container handles errors and notifications; UI callbacks must not reject.

Table loading/pagination props use `shared/table.types.ts`, independent of React
Query. The table's intersection observer only calls `onLoadMore`; the view supplies
the request callback and whether another request is allowed. Keep a bounded flex
height with `minHeight: 0` through wrappers so scrolling stays inside the table.

Run container regression checks with `npm test` from `client/`.

User creation uses only `POST /users` and the `useCreateUsers` mutation hook.
Pass a one-item `usernames` array for a single user, or several entries for multiple
users. Both cases return an array of created users; existing users are skipped.
The former `POST /users/bulk` route and `{ username, roles }` request are removed.
