import { SetMetadata } from '@nestjs/common';
import { Role } from '../utils/roles.util';

/** Metadata key used by RolesGuard to read required roles. */
export const ROLES_KEY = 'roles';

/**
 * @Roles() decorator — attach required roles to a route handler or controller.
 *
 * Usage:
 *   @Roles(Role.STORE_ADMIN, Role.STORE_USER)
 *   @Get('items')
 *   getItems() { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
