# Server Integration Guide — Permission Management

This guide walks through adding the permission management backend into your real NestJS project.
Your project uses automatic OSS login — identity is established by an external SSO/OSS provider, not a password.

---

## 1. Install dependencies

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/mongoose mongoose
npm install class-validator class-transformer
npm install --save-dev @types/passport-jwt
```

Ensure `ValidationPipe` is enabled globally (see step 9).

---

## 2. Environment variables

Add to your `.env`:

```env
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=8h
MONGO_URI=mongodb://localhost:27017/your-db-name
CLIENT_URL=https://your-frontend.example.com
```

`auth.constants.ts` will throw at startup in production if `JWT_SECRET` is missing — intentional.

---

## 3. Files to copy

Copy these directories into your `src/` verbatim:

```
server/src/common/          → your-project/src/common/
server/src/auth/            → your-project/src/auth/
server/src/users/           → your-project/src/users/
server/src/permission-requests/ → your-project/src/permission-requests/
```

After copying, the only file you need to edit is `roles.util.ts` (see step 4). Everything else wires together automatically once modules are registered.

> **Already have your own auth (SSO, JWT minting, guard)?** Skip `server/src/auth/` entirely (`auth.controller.ts`, `auth.service.ts`, `auth.module.ts`, `jwt.strategy.ts`, `auth.constants.ts`, `dto/login.dto.ts`), and skip `common/guards/jwt-auth.guard.ts`. Everything else in the table above — `common/` (minus that one guard), `users/`, `permission-requests/` — has no dependency on the `auth/` module and copies over unchanged. See step 7b for exactly what to wire up instead.

---

## 4. Update the Role enum

`src/common/utils/roles.util.ts` is the **single source of truth** for roles. Open it and replace the flow entries:

```ts
// Before (test project flows)
export enum Role {
  ANOMALY_ADMIN = 'ANOMALY_ADMIN',
  STORE_ADMIN   = 'STORE_ADMIN',
  STORE_USER    = 'STORE_USER',
  PRODUCT_ADMIN = 'PRODUCT_ADMIN',
  PRODUCT_USER  = 'PRODUCT_USER',
}

// After (your real flows)
export enum Role {
  ANOMALY_ADMIN   = 'ANOMALY_ADMIN',    // ← keep this, it's the superadmin bypass
  ORDERS_ADMIN    = 'ORDERS_ADMIN',
  ORDERS_USER     = 'ORDERS_USER',
  INVENTORY_ADMIN = 'INVENTORY_ADMIN',
  INVENTORY_USER  = 'INVENTORY_USER',
}
```

**Rules:**
- Always keep `ANOMALY_ADMIN` — the guards rely on it as the full-access bypass
- Pattern must be `{FLOW}_ADMIN` / `{FLOW}_USER` — all helpers derive flow names by splitting on `_`
- Adding a new flow = add two enum values here only, nothing else changes

Do not modify any of the helper functions (`getFlowFromRole`, `getRolesForFlow`, `getAllFlowAdminRoles`, `assertIsAnomalyAdmin`, etc.) — they work with any flow names automatically.

---

## 5. Register modules in AppModule

Also register `RolesGuard` globally via `APP_GUARD` here — this makes it apply to every
route automatically, so you never need `@UseGuards(RolesGuard)` in a controller again
(you still add `@Roles()` / `@AdminRoles()` / `@FlowRoles()` wherever you want to
restrict a route, and `@UseGuards(JwtAuthGuard)` wherever you want to require auth at all).

```ts
// src/app.module.ts
import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { PermissionRequestsModule } from './permission-requests/permission-requests.module'
import { RolesGuard } from './common/guards/roles.guard'

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/your-db'),
    AuthModule,
    UsersModule,
    PermissionRequestsModule,
    // ... your existing modules
  ],
  providers: [
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
```

Routes with no `@Roles()`/`@AdminRoles()`/`@FlowRoles()` metadata are unaffected — the
guard's own logic already treats "no required roles" as "allow any authenticated user,"
so making it global doesn't change behavior for undecorated routes.

---

## 6. Configure CORS and ValidationPipe

```ts
// src/main.ts
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
  })

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // strip unknown fields
    forbidNonWhitelisted: true, // reject requests with unknown fields
    transform: true,           // auto-transform payloads to DTO classes
  }))

  await app.listen(process.env.PORT ?? 3000)
}
```

---

## 7. OSS login — how authentication works

Your OSS system establishes the user's identity. Once you have the username, call the login endpoint to exchange it for a JWT:

```
POST /auth/login
{ "username": "alice" }
→ { "access_token": "eyJ..." }
```

**What the server does:**
- If `alice` exists in the database → JWT includes her real roles
- If `alice` does not exist → JWT is issued with empty `roles: []`
- No password validation — your OSS system is already the identity provider

The client stores this JWT and sends it as `Authorization: Bearer <token>` on every subsequent request. The JWT is stateless — it carries the user's roles at the time of login. After a role change (approve, assign), the user must log in again to get an updated token.

**How to trigger login from your frontend after OSS authentication:**
```ts
// After your OSS provider gives you the username
const res = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: ossUsername }),
})
const { access_token } = await res.json()
// Store and use this token for all subsequent API calls
```

---

## 7b. Already have your own auth/JWT/guard? Do this instead

If your project already does its own SSO exchange, mints its own JWT, and has its own guard that verifies tokens and populates `request.user`, you don't need this feature's `auth/` module at all. `RolesGuard` (`common/guards/roles.guard.ts`) only ever reads `request.user.roles` — it doesn't care which guard put it there, so your existing guard is a drop-in replacement for `JwtAuthGuard`. `RolesGuard` itself, the `@Roles`/`@AdminRoles`/`@FlowRoles` decorators, and `roles.util.ts` are all still required — nothing about those changes.

The one thing you must port over is the "look up the user's stored roles and embed them in the JWT payload" step:

1. **In your existing auth service**, at the point where you currently sign the JWT after your SSO exchange, add a lookup against the newly-copied `users` collection and embed the roles before signing:
   ```ts
   let roles: Role[]
   try {
     const user = await usersService.findByUsername(username)
     roles = user.roles.map((r) => r.role)
   } catch {
     roles = [] // not in the users collection yet — still lets them hit POST /permission-requests
   }

   const payload = { sub: username, username, roles }
   // ...sign payload with your existing JWT setup as before
   ```
   This is the same logic as `auth/auth.service.ts`'s `login()` method in this reference implementation — only the surrounding token-minting call changes, not this lookup.

2. **Confirm your existing guard attaches the decoded payload to `request.user`** (standard behavior for a passport `validate()` return value, or equivalent in your own guard) — no guard changes needed as long as `request.user.roles` ends up populated.

3. **Adapt `common/interfaces/authed-request.interface.ts`** — it currently types `user` as this feature's own `JwtPayload` (imported from `auth/jwt.strategy.ts`, which you're skipping). Point it at your own decoded-token type instead; it just needs a `roles: Role[]` field for `RolesGuard` to read.

4. **Swap the guard in the copied controllers** — replace every `@UseGuards(JwtAuthGuard, ...)` / `@UseGuards(JwtAuthGuard)` in `users.controller.ts` and `permission-requests.controller.ts` with `@UseGuards(YourExistingGuard, ...)`.

5. **Still bootstrap the first ANOMALY_ADMIN somehow.** `POST /auth/seed` normally does this, but it lives in the `auth/` module you're skipping. It only depends on `UsersService` (`usersService.createUser(username, [Role.ANOMALY_ADMIN])`) — no JWT/login logic — so port just that one endpoint (or an equivalent one-off script) into your own project.

---

## 8. Seed the first superadmin

On first deploy, there are no users in the database. Bootstrap the superadmin:

```bash
curl -X POST http://localhost:3000/auth/seed
# → { "message": "superadmin created with ANOMALY_ADMIN role" }
```

Then log in as `superadmin` to get a JWT with `ANOMALY_ADMIN` — this is the only role that can approve/reject permission requests or assign/remove roles on other users (see step 11); flow admins cannot do this even within their own flow.

You can change the seed username in `src/auth/auth.constants.ts`:
```ts
export const SEED_ADMIN_USERNAME = 'superadmin' // change to your preferred name
```

---

## 9. Guard overview — how route protection works

There are two guards that work together on every protected endpoint:

### JwtAuthGuard
Validates the Bearer token and populates `req.user` with the JWT payload (`{ sub, username, roles }`). Apply this to every controller that requires authentication.

```ts
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('your-resource')
export class YourController {}
```

### RolesGuard
Checks that `req.user.roles` contains at least one of the roles specified by the `@Roles()` / `@AdminRoles()` / `@FlowRoles()` decorators. ANOMALY_ADMIN bypasses all role checks automatically.

Registered globally via `APP_GUARD` in step 5, so it runs on every route without needing `@UseGuards(RolesGuard)` anywhere — just add the decorator:

```ts
@AdminRoles()
@Controller('your-admin-resource')
export class YourAdminController {}
```

---

## 10. Decorators — controlling access per endpoint

Three decorators are available. Import from `src/common/decorators/roles.decorator.ts`.
Since `RolesGuard` is registered globally (step 5), you only need `@UseGuards(JwtAuthGuard)`
to require authentication — the decorators below are all that's needed to layer role
restrictions on top.

### `@Roles(...roles)` — explicit role list
Only users who have at least one of the listed roles can access the endpoint.

```ts
import { Roles } from '../common/decorators/roles.decorator'
import { Role } from '../common/utils/roles.util'

@Get('orders')
@UseGuards(JwtAuthGuard)
@Roles(Role.ORDERS_ADMIN, Role.ORDERS_USER)
findAll() { ... }
```

### `@AdminRoles()` — any flow admin
Allows any `*_ADMIN` role (but not `*_USER`). Used on cross-flow write endpoints that any
admin should reach, e.g. listing/reviewing resources across flows — see `findAll`/`findOne`
in `permission-requests.controller.ts`, which use it for viewing (not managing) requests.

```ts
@Post('reports')
@UseGuards(JwtAuthGuard)
@AdminRoles()
createReport(@Body() dto, @Request() req: AuthedRequest) {
  // Any flow admin can reach this — if the action needs to stay within the
  // requester's own flow, check that explicitly in the service using
  // getFlowFromRole()/getRolesForFlow() from roles.util.ts.
  // NOTE: this is unrelated to role/permission management, which is always
  // ANOMALY_ADMIN-only regardless of flow — see step 11.
}
```

### `@FlowRoles(flow)` — specific flow (admin + user)
Allows both `{FLOW}_ADMIN` and `{FLOW}_USER` for a given flow. Use this on read endpoints for flow-specific resources.

```ts
@Get('orders/items')
@UseGuards(JwtAuthGuard)
@FlowRoles('ORDERS')
findOrderItems() { ... }
// Allows ORDERS_ADMIN and ORDERS_USER (and ANOMALY_ADMIN)
```

---

## 11. Two separate permission layers — don't conflate them

This system has two independent layers, and it's easy to assume they work the same way. They don't:

1. **Feature/resource access** — gated by `@FlowRoles(flow)` / `@AdminRoles()` / `@Roles(...)` on
   **your own controllers**, exactly as shown in steps 9, 10, and 12. This is what "flows" are
   for, and it applies broadly: every real feature area in your destination project should be
   wrapped in the roles for its own flow (e.g. `@FlowRoles('ORDERS')` on your orders controller,
   `@FlowRoles('INVENTORY')` on your inventory controller, and so on for every feature you have —
   not just one or two). `ORDERS_USER`/`ORDERS_ADMIN` reaching your `orders` endpoints is a normal,
   expected, self-service flow — no special approval logic needed beyond the decorator.

   This reference repo's `store-management`/`product-management` controllers are only a demo of
   that pattern for the throwaway `STORE`/`PRODUCT` test flows — that's why they're deliberately
   left out of the "files to copy" list in step 3. Don't port them; instead, put the same
   `@FlowRoles`/`@AdminRoles`/`@Roles` decorators directly on your project's real, existing
   controllers.

2. **Role management** — i.e. deciding *who gets which role* — is intentionally **not**
   flow-scoped, and is **restricted to `ANOMALY_ADMIN` only**. Creating a user with roles,
   assigning a role, removing a role, and approving/rejecting a permission request all call
   `assertIsAnomalyAdmin` (`common/utils/roles.util.ts`), which throws `ForbiddenException`
   for anyone else. An `ORDERS_ADMIN` cannot assign `ORDERS_USER` to a teammate, even within
   their own flow — only `ANOMALY_ADMIN` can. (The one exception is read-only: flow admins can
   still list permission requests scoped to their own flow via `GET /permission-requests`,
   which filters by `getFlowFromRole`/`getRolesForFlow` in `permission-requests.service.ts` —
   they just can't act on them.)

   Use `assertIsAnomalyAdmin` from `roles.util.ts` in any new service method that mutates roles
   or approves/rejects requests:

   ```ts
   import { assertIsAnomalyAdmin } from '../common/utils/roles.util'

   async assignRole(targetUsername: string, roleToAssign: Role, requesterRoles: Role[]) {
     // Throws ForbiddenException unless requester has ANOMALY_ADMIN
     assertIsAnomalyAdmin(requesterRoles, 'assign')
     // ... proceed with assignment
   }
   ```

   This is already implemented inside `UsersService` and `PermissionRequestsService` — you only
   need to call it if you add new service methods that touch roles.

In short: flow roles are for reaching your own project's features; only `ANOMALY_ADMIN` decides
who holds those roles in the first place.

---

## 12. Protecting your own existing routes

`RolesGuard` is global (step 5), so protecting a controller only ever needs
`@UseGuards(JwtAuthGuard)` plus the decorator for whatever restriction you want:

```ts
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { FlowRoles, Roles } from './common/decorators/roles.decorator'
import { Role } from './common/utils/roles.util'

// Require any valid JWT (authenticated, any role)
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {}

// Require a specific flow's roles
@UseGuards(JwtAuthGuard)
@FlowRoles('ORDERS')
@Controller('orders')
export class OrdersController {}

// Require only admins (any flow)
@UseGuards(JwtAuthGuard)
@AdminRoles()
@Controller('admin/reports')
export class AdminReportsController {}

// Require a single specific role
@UseGuards(JwtAuthGuard)
@Roles(Role.ORDERS_ADMIN)
@Post('orders/override')
forceClose() {}
```

The `ANOMALY_ADMIN` role bypasses all `RolesGuard` checks — it always passes.

---

## 13. Key API endpoints

Once integrated, these endpoints are available:

| Method | Path | Auth required | Who can call |
|--------|------|---------------|--------------|
| POST | `/auth/login` | No | Anyone (OSS username exchange) |
| POST | `/auth/seed` | No | One-time bootstrap only |
| GET | `/users` | JWT | Any authenticated user |
| POST | `/users` | JWT + `ANOMALY_ADMIN` | ANOMALY_ADMIN only |
| PATCH | `/users/:username/roles` | JWT + `ANOMALY_ADMIN` | ANOMALY_ADMIN only |
| DELETE | `/users/:username/roles/:role` | JWT + `ANOMALY_ADMIN` | ANOMALY_ADMIN only |
| GET | `/permission-requests` | JWT + any `*_ADMIN` | Admins see all (read-only for flow admins); scoped by flow |
| GET | `/permission-requests/my-requests` | JWT | Any user — sees only their own |
| POST | `/permission-requests` | JWT | Any authenticated user |
| PATCH | `/permission-requests/:id/approve` | JWT + `ANOMALY_ADMIN` | ANOMALY_ADMIN only |
| PATCH | `/permission-requests/:id/reject` | JWT + `ANOMALY_ADMIN` | ANOMALY_ADMIN only |

---

## 14. Adding a new flow in the future

1. Add two values to the `Role` enum in `roles.util.ts`:
   ```ts
   BILLING_ADMIN = 'BILLING_ADMIN',
   BILLING_USER  = 'BILLING_USER',
   ```
2. Add the same two values to the client's `Role` type and `ALL_ROLES` array in `auth/types.ts`
3. That's it — all guards, helpers, and the permission management UI adapt automatically

---

## Summary checklist

- [ ] Dependencies installed
- [ ] `.env` has `JWT_SECRET`, `MONGO_URI`, `CLIENT_URL`
- [ ] Role enum updated in `roles.util.ts` to match your flows
- [ ] `AuthModule`, `UsersModule`, `PermissionRequestsModule` registered in `AppModule`
- [ ] `RolesGuard` registered globally via `APP_GUARD` in `AppModule`
- [ ] `MongooseModule.forRoot(...)` configured
- [ ] `enableCors` and `ValidationPipe` set up in `main.ts`
- [ ] Superadmin seeded via `POST /auth/seed`
- [ ] Existing controllers protected with `@UseGuards(JwtAuthGuard)` where needed
- [ ] Flow-scoped controllers use `@FlowRoles('YOUR_FLOW')` (no need to add `RolesGuard` per-controller — it's global)
- [ ] OSS login flow calls `POST /auth/login { username }` and forwards the JWT to the client
- [ ] **OR** (if you already have your own auth): skipped the `auth/` module + `JwtAuthGuard`, wired a roles lookup into your own token-minting step instead (see step 7b), and ported the ANOMALY_ADMIN seed logic separately
