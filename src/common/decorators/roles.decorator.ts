import { SetMetadata } from '@nestjs/common';
import { Role, getAllFlowAdminRoles } from '../utils/roles.util';

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

/**
 * @AdminRoles() decorator — grants access to ALL flow-level admins automatically.
 *
 * Reads admin roles dynamically from the Role enum at startup, so adding a new
 * flow (e.g. ORDER_ADMIN) requires NO changes here or in any controller.
 * ANOMALY_ADMIN is excluded because it is already handled by the RolesGuard bypass.
 *
 * Usage:
 *   @AdminRoles()
 *   @Get()
 *   findAll() { ... }
 */
export const AdminRoles = () => SetMetadata(ROLES_KEY, getAllFlowAdminRoles());
