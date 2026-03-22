import { SetMetadata } from '@nestjs/common';
import { Role, getAllFlowAdminRoles, getRolesForFlow } from '../utils/roles.util';

export const ROLES_KEY = 'roles';

/**
 * @Roles() decorator — attach required roles to a route handler or controller.
 * 
 * usage: @Roles(Role.STORE_ADMIN, Role.PRODUCT_USER) means that both STORE_ADMIN and
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/**
 * @AdminRoles() decorator — grants access to ALL flow-level admins automatically.
 *
 * Reads admin roles dynamically from the Role enum at startup, so adding a new
 * flow (e.g. ORDER_ADMIN) requires NO changes here or in any controller.
 * ANOMALY_ADMIN is excluded because it is already handled by the RolesGuard bypass.
 *
 * NOTE: getAllFlowAdminRoles() is called ONCE at module load time — the result is
 * frozen into route metadata. This is intentional: roles are defined statically in
 * the Role enum. If you ever load roles from a database at runtime, this decorator
 * will NOT reflect those changes without a restart.
 * 
 * Usage: simply add @AdminRoles() to any route handler or controller that should be
 */
export const AdminRoles = () => SetMetadata(ROLES_KEY, getAllFlowAdminRoles());

/**
 * @FlowRoles(flow) — grants access to all roles belonging to a specific flow.
 *
 * Resolves roles dynamically from the Role enum, so adding ORDER_ADMIN/ORDER_USER
 * to the enum automatically makes @FlowRoles('ORDER') work — no other changes needed.
 * 
 * usage: @FlowRoles('STORE') is equivalent to @Roles(Role.STORE_ADMIN, Role.STORE_USER).
 */
export const FlowRoles = (flow: string) => SetMetadata(ROLES_KEY, getRolesForFlow(flow));
