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

Do not modify any of the helper functions (`getFlowFromRole`, `canAdminManageRole`, `assertAdminCanManageRoles`, etc.) — they work with any flow names automatically.

---

## 5. Register modules in AppModule

```ts
// src/app.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { PermissionRequestsModule } from './permission-requests/permission-requests.module'

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/your-db'),
    AuthModule,
    UsersModule,
    PermissionRequestsModule,
    // ... your existing modules
  ],
})
export class AppModule {}
```

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

## 8. Seed the first superadmin

On first deploy, there are no users in the database. Bootstrap the superadmin:

```bash
curl -X POST http://localhost:3000/auth/seed
# → { "message": "superadmin created with ANOMALY_ADMIN role" }
```

Then log in as `superadmin` to get a JWT with `ANOMALY_ADMIN` — this account can approve permission requests and assign roles to other users.

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

```ts
import { RolesGuard } from './common/guards/roles.guard'

@UseGuards(JwtAuthGuard, RolesGuard)
@AdminRoles()
@Controller('your-admin-resource')
export class YourAdminController {}
```

---

## 10. Decorators — controlling access per endpoint

Three decorators are available. Import from `src/common/decorators/roles.decorator.ts`.

### `@Roles(...roles)` — explicit role list
Only users who have at least one of the listed roles can access the endpoint.

```ts
import { Roles } from '../common/decorators/roles.decorator'
import { Role } from '../common/utils/roles.util'

@Get('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ORDERS_ADMIN, Role.ORDERS_USER)
findAll() { ... }
```

### `@AdminRoles()` — any flow admin
Allows any `*_ADMIN` role (but not `*_USER`). Used on write endpoints that any admin can reach, with service-layer flow scoping applied afterward.

```ts
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@AdminRoles()
create(@Body() dto, @Request() req: AuthedRequest) {
  // Then use assertAdminCanManageRoles inside the service
  // to enforce that STORE_ADMIN can only act on STORE_* roles
}
```

### `@FlowRoles(flow)` — specific flow (admin + user)
Allows both `{FLOW}_ADMIN` and `{FLOW}_USER` for a given flow. Use this on read endpoints for flow-specific resources.

```ts
@Get('orders/items')
@UseGuards(JwtAuthGuard, RolesGuard)
@FlowRoles('ORDERS')
findOrderItems() { ... }
// Allows ORDERS_ADMIN and ORDERS_USER (and ANOMALY_ADMIN)
```

---

## 11. Service-layer flow scoping

The guard only checks "does this user have any admin role." The service layer enforces flow isolation — an `ORDERS_ADMIN` must not be able to assign `INVENTORY_ADMIN` roles.

Use `assertAdminCanManageRoles` from `roles.util.ts` in any service method that mutates roles:

```ts
import { assertAdminCanManageRoles } from '../common/utils/roles.util'

async assignRole(targetUsername: string, roleToAssign: Role, requesterRoles: Role[]) {
  // Throws ForbiddenException if requester doesn't manage the target role's flow
  assertAdminCanManageRoles(requesterRoles, [roleToAssign], 'assign')
  // ... proceed with assignment
}
```

This is already implemented inside `UsersService` and `PermissionRequestsService` — you only need to call it if you add new service methods that touch roles.

---

## 12. Protecting your own existing routes

To protect an existing controller in your project, add the guards and decorators:

```ts
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { RolesGuard } from './common/guards/roles.guard'
import { FlowRoles, Roles } from './common/decorators/roles.decorator'
import { Role } from './common/utils/roles.util'

// Require any valid JWT (authenticated, any role)
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {}

// Require a specific flow's roles
@UseGuards(JwtAuthGuard, RolesGuard)
@FlowRoles('ORDERS')
@Controller('orders')
export class OrdersController {}

// Require only admins (any flow)
@UseGuards(JwtAuthGuard, RolesGuard)
@AdminRoles()
@Controller('admin/reports')
export class AdminReportsController {}

// Require a single specific role
@UseGuards(JwtAuthGuard, RolesGuard)
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
| POST | `/users` | JWT + any `*_ADMIN` | Flow admins (service enforces flow scope) |
| PATCH | `/users/:username/roles` | JWT + any `*_ADMIN` | Flow admins |
| DELETE | `/users/:username/roles/:role` | JWT + any `*_ADMIN` | Flow admins |
| GET | `/permission-requests` | JWT + any `*_ADMIN` | Admins see all; scoped by flow |
| GET | `/permission-requests/my-requests` | JWT | Any user — sees only their own |
| POST | `/permission-requests` | JWT | Any authenticated user |
| PATCH | `/permission-requests/:id/approve` | JWT + any `*_ADMIN` | Flow admins |
| PATCH | `/permission-requests/:id/reject` | JWT + any `*_ADMIN` | Flow admins |

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
- [ ] `MongooseModule.forRoot(...)` configured
- [ ] `enableCors` and `ValidationPipe` set up in `main.ts`
- [ ] Superadmin seeded via `POST /auth/seed`
- [ ] Existing controllers protected with `@UseGuards(JwtAuthGuard)` where needed
- [ ] Flow-scoped controllers use `@FlowRoles('YOUR_FLOW')` + `RolesGuard`
- [ ] OSS login flow calls `POST /auth/login { username }` and forwards the JWT to the client
