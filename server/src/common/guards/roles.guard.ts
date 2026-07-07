import { Injectable, CanActivate, ExecutionContext, Type } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../utils/roles.util';

/**
 * RolesGuard — checks that the authenticated user has at least one of the
 * required roles declared via @Roles().
 *
 * Logic:
 *   1. Look for @Roles() metadata on the handler, then the controller.
 *   2. If neither has any, fall back to the metadata on the Nest module
 *      that owns the controller — this lets a flow module declare a default
 *      via @Roles()/@FlowRoles()/@AdminRoles() on itself (above @Module()),
 *      instead of every controller it imports repeating the decorator.
 *   3. If nothing is found anywhere → grant access (route is roles-unprotected).
 *   4. If user has ANOMALY_ADMIN → grant access (full override).
 *   5. Otherwise → grant access only if user has ≥1 of the required roles.
 *
 * Must be used AFTER JwtAuthGuard so that request.user is populated.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles(Role.STORE_ADMIN, Role.STORE_USER)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  // Controller → flow roles, memoized since the module graph is fixed after bootstrap.
  private readonly flowRolesCache = new Map<Type<unknown>, Role[] | undefined>();

  constructor(
    private readonly reflector: Reflector,
    private readonly modulesContainer: ModulesContainer,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const controllerClass = context.getClass();

    // Read the required roles from @Roles() metadata — handler first, then controller.
    // Falls back to the owning flow module's own @Roles() metadata if neither has any.
    const requiredRoles =
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), controllerClass]) ??
      this.getFlowRoles(controllerClass);

    // No @Roles() anywhere → route is accessible to any authenticated user
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { roles: Role[] };

    // user.roles comes from the JWT payload (stateless — no DB lookup)
    const userRoles: Role[] = user?.roles ?? [];

    // ANOMALY_ADMIN overrides all role checks
    if (userRoles.includes(Role.ANOMALY_ADMIN)) {
      return true;
    }

    // Grant if user holds at least one of the required roles
    return requiredRoles.some((required) => userRoles.includes(required));
  }

  private getFlowRoles(controllerClass: Type<unknown>): Role[] | undefined {
    if (this.flowRolesCache.has(controllerClass)) {
      return this.flowRolesCache.get(controllerClass);
    }

    let roles: Role[] | undefined;
    for (const module of this.modulesContainer.values()) {
      const ownsController = [...module.controllers.values()].some(
        (wrapper) => wrapper.metatype === controllerClass,
      );
      if (ownsController) {
        roles = Reflect.getMetadata(ROLES_KEY, module.metatype);
        break;
      }
    }

    this.flowRolesCache.set(controllerClass, roles);
    return roles;
  }
}
