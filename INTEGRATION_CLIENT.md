# Client Integration Guide — Permission Management

This guide walks through wiring the `permissionManagement` feature into your real project from scratch.

---

## 1. Install dependencies

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install @tanstack/react-query axios jwt-decode
```

---

## 2. Configure the path alias

The entire feature uses `@/` as the root import alias. Make sure your project has this configured.

**vite.config.ts**
```ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**tsconfig.json** (inside `compilerOptions`)
```json
"baseUrl": ".",
"paths": {
  "@/*": ["src/*"]
}
```

---

## 3. Environment variable

Add to your `.env` (and `.env.example`):

```
VITE_API_BASE_URL=https://your-api.example.com
```

This is consumed by `axiosClient` as the base URL for all API calls.

---

## 4. Copy the feature files

Copy the entire `client/src/features/permissionManagement/` directory into your project as-is.

Also copy these support files and adapt them (see sections below):

| Source | Destination | Action |
|--------|-------------|--------|
| `src/features/auth/types.ts` | `src/features/auth/types.ts` | **Edit** — update the Role enum |
| `src/app/constants.ts` | `src/app/constants.ts` | **Edit** — change TOKEN_KEY if needed |
| `src/app/api/axiosClient.ts` | `src/app/api/axiosClient.ts` | **Copy or merge** into your axios instance |
| `src/app/providers/AuthProvider.tsx` | `src/app/providers/AuthProvider.tsx` | **Copy or merge** |
| `src/app/providers/QueryProvider.tsx` | `src/app/providers/QueryProvider.tsx` | **Copy or skip** if you already have a QueryClientProvider |

---

## 5. Update the Role enum

Open `src/features/auth/types.ts` and replace the `Role` type and `ALL_ROLES` array with your project's flows.

The pattern is `{FLOW}_ADMIN` / `{FLOW}_USER`. Example:

```ts
// Before (test project flows)
export type Role =
  | 'ANOMALY_ADMIN'
  | 'STORE_ADMIN'
  | 'STORE_USER'
  | 'PRODUCT_ADMIN'
  | 'PRODUCT_USER'

// After (your real flows — adjust to match your server's Role enum)
export type Role =
  | 'ANOMALY_ADMIN'
  | 'ORDERS_ADMIN'
  | 'ORDERS_USER'
  | 'INVENTORY_ADMIN'
  | 'INVENTORY_USER'

export const ALL_ROLES: Role[] = [
  'ANOMALY_ADMIN',
  'ORDERS_ADMIN',
  'ORDERS_USER',
  'INVENTORY_ADMIN',
  'INVENTORY_USER',
]
```

**Important:** the Role enum on the client must exactly match the server's `Role` enum in `roles.util.ts` — same string values, same spelling.

Do not change `getFlowFromRole` or `filterRequestableRoles` — they work with any flow names automatically.

---

## 6. Set TOKEN_KEY

`src/app/constants.ts`:
```ts
export const TOKEN_KEY = 'your_project_token_key'
```

This is the localStorage key where the JWT is stored. Pick whatever key your project uses. Every consumer (`axiosClient`, `AuthProvider`, the router guard) imports from here — change it in one place.

---

## 7. Wire up the axios client

`src/app/api/axiosClient.ts` does two things:
1. Attaches `Authorization: Bearer <token>` to every request
2. On 401, clears the token and redirects to `/login`

If your project already has an axios instance, merge these two interceptors into it instead of using the one from this project.

The `permissionManagement` services import `apiClient` from `@/app/api/axiosClient`. If you use a different export name or path, do a find-and-replace in the two service files:
- `permissionManagement/users/services/usersApi.ts`
- `permissionManagement/roleSubmissions/services/roleSubmissionsApi.ts`

---

## 8. Wrap your app with providers

`AuthProvider` reads the JWT from localStorage on mount and exposes auth state to the whole tree. `QueryProvider` sets up the TanStack Query cache.

```tsx
// main.tsx or App.tsx
import { QueryProvider } from '@/app/providers/QueryProvider'
import { AuthProvider } from '@/app/providers/AuthProvider'

<QueryProvider>
  <AuthProvider>
    <YourRouter />
  </AuthProvider>
</QueryProvider>
```

If your project already has a `QueryClientProvider`, skip `QueryProvider` and just add `AuthProvider`.

---

## 9. OSS login — calling `login()` after authentication

Your project uses automatic OSS login — the identity provider hands you the username, and you exchange it for a JWT by calling the backend login endpoint.

After OSS gives you the username, make this call:

```ts
import { useAuth } from '@/app/providers/AuthProvider'

const { login } = useAuth()

// Call after OSS authentication gives you the username
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: ossUsername }),
})
const { access_token } = await response.json()

// Store the token and update auth state in one call
login(access_token)
```

`login(token)` stores the JWT in localStorage under `TOKEN_KEY` and decodes it to populate `username`, `roles`, `isAdmin`, etc. immediately — no page reload needed.

---

## 10. Protect routes by role

Use `useAuth()` inside your route guard or component to check roles before rendering.

### TanStack Router (same as this project)

```ts
import { createRoute, redirect } from '@tanstack/react-router'
import { TOKEN_KEY } from '@/app/constants'

// Protect any route — redirect to login if no token
const protectedRoute = createRoute({
  beforeLoad: () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      throw redirect({ to: '/login' })
    }
  },
})

// Protect an admin-only route — redirect to home if not admin
const adminRoute = createRoute({
  beforeLoad: ({ context }) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) throw redirect({ to: '/login' })
    // Decode and check role — or use a shared helper
    const payload = JSON.parse(atob(token.split('.')[1]))
    const isAdmin = payload.roles?.some((r: string) => r.endsWith('_ADMIN'))
    if (!isAdmin) throw redirect({ to: '/home' })
  },
})
```

### React Router v6

```tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'

// Wrap any route that requires authentication
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Wrap any route that requires admin access
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/home" replace />
  return <>{children}</>
}

// Usage in your router
<Route path="/settings" element={<RequireAdmin><PermissionManagementPage /></RequireAdmin>} />
```

### Hiding nav items conditionally

```tsx
import { useAuth } from '@/app/providers/AuthProvider'

function Sidebar() {
  const { isAdmin, isFlowAdmin } = useAuth()

  return (
    <nav>
      <NavItem to="/home">Home</NavItem>
      {isAdmin && <NavItem to="/settings">User Management</NavItem>}
      {isFlowAdmin('ORDERS') && <NavItem to="/orders">Orders</NavItem>}
    </nav>
  )
}
```

`isAdmin` — true for any `*_ADMIN` role including `ANOMALY_ADMIN`
`isFlowAdmin('ORDERS')` — true only for `ORDERS_ADMIN` or `ANOMALY_ADMIN`
`isAnomalyAdmin` — true only for `ANOMALY_ADMIN` (full access)

---

## 11. Mount the Permission Management page

```tsx
import { PermissionManagementPage } from '@/features/permissionManagement'

// Mount on any route — the page handles its own tab/table/dialog state
<Route path="/settings" element={<PermissionManagementPage />} />
```

The page self-adapts based on the logged-in user's roles:
- **Non-admin users** — see only their own role submissions + a "Submit role" button
- **Flow admins** — read-only visibility of all users and requests scoped to their flow; cannot add users, assign/remove roles, or approve/reject requests
- **ANOMALY_ADMIN** — full access: can add users, assign/remove roles, and approve/reject requests

No props needed — it reads from `useAuth()` internally.

---

## 12. After a role change — re-login required

The JWT is stateless. When an admin assigns or approves a role for a user, that user's token still carries their old roles until they log in again. Make sure your UI communicates this:

```tsx
// Example: show a banner after role assignment
"Your new roles will take effect after your next login."
```

If you want seamless role updates without re-login, that requires server-side session management (out of scope for this feature).

---

## Summary checklist

- [ ] Peer dependencies installed
- [ ] `@/` path alias configured in vite + tsconfig
- [ ] `VITE_API_BASE_URL` set in `.env`
- [ ] Role enum updated to match your server
- [ ] `TOKEN_KEY` set to your project's localStorage key
- [ ] `axiosClient` has the Bearer interceptor + 401 handler
- [ ] `AuthProvider` and `QueryProvider` wrapping the app
- [ ] OSS login calls `login(access_token)` after getting the JWT
- [ ] Routes protected via `useAuth()` checks
- [ ] `PermissionManagementPage` mounted on an admin-accessible route

