# Permission Management

A React/TypeScript client and NestJS/MongoDB API for managing users, roles,
and permission requests. Store and product pages demonstrate flow-specific access.
Authentication is a local demo: username-only login issues a JWT. Replace that
login with the target application's authentication when integrating.

## Project layout

```text
client/
  src/app/                         # Router, theme, auth helpers, HTTP client
  src/features/permissionManagement/
    CLAUDE.md                      # UI/host integration instructions
    permissionManagementUi/        # Copyable components, styles and UI contracts
    permissionManagementHost/      # App-specific data, auth and notifications
server/                            # NestJS API and MongoDB models
compose.yaml                       # Container build with Nginx client
compose.dev.yaml                   # Development containers with source mounts
```

## Run with Docker

Install Docker with Compose support. From the repository root, copy `.env.example`
to `.env` and adjust ports or the JWT secret as needed. On PowerShell:

```powershell
Copy-Item .env.example .env
npm run docker:dev
```

Development mode runs Vite and Nest watch processes with mounted source folders.
Open [the client](http://localhost:8080). Default host ports are:

| Service | Host address                                      |
| ------- | ------------------------------------------------- |
| Client  | `http://localhost:8080`                           |
| API     | `http://localhost:3000`                           |
| MongoDB | `mongodb://localhost:27018/permission-management` |

Compose enables `AUTO_SEED_ADMIN`, creating `superadmin` with `ANOMALY_ADMIN`.
Sign in as `superadmin` to manage users. Any other username can sign in with no
roles and request permission. Sign in again after role changes to get a new JWT.

Stop development containers with `npm run docker:dev:down`. To build and run the
Nginx-served client and API instead, use `npm run docker:up`; stop them with
`docker compose down`. MongoDB data persists in the named volume. Do not run both
Compose configurations at once on the same ports.

## Run without Docker

Use Node.js 22 (matching the Dockerfiles), npm, and a running MongoDB instance.
Install both applications from the repository root:

```shell
npm run install:all
```

Set server environment variables in the shell before starting the API:

| Variable          | Local value / behavior                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `MONGO_URI`       | Defaults to `mongodb://localhost:27017/permission-management`; use port `27018` if connecting to Compose MongoDB from the host |
| `PORT`            | Defaults to `3000`                                                                                                             |
| `CLIENT_URL`      | Defaults to `http://localhost:5173` for CORS                                                                                   |
| `JWT_SECRET`      | Set a local signing secret                                                                                                     |
| `AUTO_SEED_ADMIN` | Set to `true` to create `superadmin` on startup                                                                                |

The root `.env` is used by Compose; the server reads shell environment variables
and does not automatically load that file. Start the API and client in separate
terminals:

```shell
npm run dev:server
npm run dev:client
```

Open Vite's displayed URL (normally `http://localhost:5173`). The client defaults
to same-origin API requests through Vite's proxy to `http://localhost:3000`.
Set `API_PROXY_TARGET` in the Vite process environment to change the proxy target.
Alternatively, copy `client/.env.example` to `client/.env` and set
`VITE_API_BASE_URL` to call an API directly; configure `CLIENT_URL` accordingly.
Without automatic seeding, `POST /auth/seed` creates the demo administrator.

## Reuse the UI in another project

Copy `client/src/features/permissionManagement/permissionManagementUi/`.
Provide React/React DOM, MUI Material/icons, Emotion, and your app's theme.
Connect data and callbacks using `UsersViewModel` and
`PermissionRequestsViewModel`; adapt the host subfolder as an example.
The UI does not depend on this project's HTTP client, auth, router, React Query,
or Notistack. Keep the host layout bounded so tables scroll internally.

The route-facing component is still named `PermissionManagementPage`, imported
from `permissionManagementHost/PermissionManagementPage.tsx` in this app.
See [the feature guide](client/src/features/permissionManagement/CLAUDE.md) for
props, callbacks, notifications, folder boundaries, and target-app wiring.

## Checks

```shell
npm --prefix client run build
npm --prefix client test
npm --prefix server run build
```

Client tests cover host query/mutation behavior and the UI dependency boundary.
All component styling belongs in separate `.style.tsx` files; avoid inline `sx`.
