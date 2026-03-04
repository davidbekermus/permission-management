import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role, hasAnomalyAdmin } from '../utils/roles.util';

/**
 * RolesGuard — checks that the authenticated user has at least one of the
 * required roles declared via @Roles().
 *
 * Logic:
 *   1. If no @Roles() metadata → grant access (route is roles-unprotected).
 *   2. If user has ANOMALY_ADMIN → grant access (full override).
 *   3. Otherwise → grant access only if user has ≥1 of the required roles.
 *
 * Must be used AFTER JwtAuthGuard so that request.user is populated.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles(Role.STORE_ADMIN, Role.STORE_USER)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Read the required roles from @Roles() metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() decorator → route is accessible to any authenticated user
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { roles: Role[] };

    // user.roles comes from the JWT payload (stateless — no DB lookup)
    const userRoles: Role[] = user?.roles ?? [];

    // ANOMALY_ADMIN overrides all role checks
    if (hasAnomalyAdmin(userRoles)) {
      return true;
    }

    // Grant if user holds at least one of the required roles
    return requiredRoles.some((required) => userRoles.includes(required));
  }
}
