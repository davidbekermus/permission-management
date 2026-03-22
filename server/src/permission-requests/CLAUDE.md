# Permission Management — Backend Modules

Three interdependent NestJS modules that implement RBAC with a permission request approval flow.

## Modules to copy

All three must be copied together — they reference each other:

```
src/
├── auth/               # JWT login, seed superadmin endpoint
├── users/              # User CRUD, role assignment
├── permission-requests/ # Request creation and approval flow
└── common/             # Guards, decorators, role utils — MUST also be copied
    ├── guards/
    │   ├── jwt-auth.guard.ts
    │   └── roles.guard.ts
    ├── decorators/
    │   └── roles.decorator.ts
    ├── interfaces/
    │   └── authed-request.interface.ts
    └── utils/
        └── roles.util.ts   ← single source of truth for all roles
```

## Peer dependencies

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/mongoose mongoose
npm install class-validator class-transformer
npm install @types/passport-jwt --save-dev
```

Enable `ValidationPipe` globally in `main.ts`:
```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

## MongoDB

Requires a Mongoose connection registered in your `AppModule`:
```ts
MongooseModule.forRoot('mongodb://localhost:27017/your-db')
```

Collections created automatically: `users`, `permissionrequests`.

## JWT setup

Set `JWT_SECRET` in your environment (or hardcode for dev — see `auth.constants.ts`).
Register `JwtModule` in `AuthModule` with the same secret.

## Role system

All roles live in `common/utils/roles.util.ts`. Pattern: `{FLOW}_ADMIN` / `{FLOW}_USER`.

- `ANOMALY_ADMIN` — superadmin, bypasses all role guards
- `STORE_ADMIN` / `STORE_USER`, `PRODUCT_ADMIN` / `PRODUCT_USER` — example flows

**Adding a new flow:** add 2 entries to the `Role` enum in `roles.util.ts`. Nothing else needs to change.

## Auth endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | /auth/seed | — | Creates `superadmin` user with `ANOMALY_ADMIN` role. Run once to bootstrap. |
| POST | /auth/login | `{ username }` | Returns a JWT. No password (OSS simulation). User not in DB → JWT with empty roles. |

JWT is **stateless** — users must re-login after their roles change.

## Permission request flow

1. `POST /auth/seed` — create superadmin
2. `POST /auth/login { username: "alice" }` → JWT with no roles
3. `POST /permission-requests { roles: ["STORE_USER"] }` (alice's JWT)
4. `PATCH /permission-requests/:id/approve { roles: ["STORE_USER"] }` (superadmin JWT)
5. Alice re-logins → JWT now includes `STORE_USER`

User documents are **only created in MongoDB on approval** — not on login.

## Users endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | /users | JWT + admin role | List users, supports `?username=` search |
| POST | /users | JWT + admin role | Add user directly with roles |
| PATCH | /users/:id/roles | JWT + admin role | Assign or remove roles from a user |
