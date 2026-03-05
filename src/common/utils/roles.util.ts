import { ForbiddenException } from '@nestjs/common';

/**
 * Central Role enum — single source of truth for all roles in the system.
 *
 * Naming convention: {FLOW}_{TYPE}
 *   - FLOW: uppercase string identifying the feature area (e.g. STORE, PRODUCT)
 *   - TYPE: either ADMIN or USER
 *
 * Special case: ANOMALY_ADMIN has no flow and overrides ALL permissions.
 *
 * Adding a new flow (e.g. ORDER) requires ONLY adding two lines here:
 *   ORDER_ADMIN = 'ORDER_ADMIN',
 *   ORDER_USER  = 'ORDER_USER',
 */
export enum Role {
  ANOMALY_ADMIN = 'ANOMALY_ADMIN',

  STORE_ADMIN = 'STORE_ADMIN',
  STORE_USER = 'STORE_USER',

  PRODUCT_ADMIN = 'PRODUCT_ADMIN',
  PRODUCT_USER = 'PRODUCT_USER',
}

// ---------------------------------------------------------------------------
// Role Helper Utilities
// All flow-related logic lives HERE. Services must use these helpers instead
// of hardcoding flow checks or role string comparisons.
// ---------------------------------------------------------------------------

/**
 * Returns true if the role is ANOMALY_ADMIN.
 */
export function isAnomalyAdmin(role: Role): boolean {
  return role === Role.ANOMALY_ADMIN;
}

/**
 * Returns true if the role is an admin-level role.
 * All roles ending in _ADMIN (including ANOMALY_ADMIN) are admin roles.
 */
export function isAdminRole(role: Role): boolean {
  return role.endsWith('_ADMIN');
}

/**
 * Extracts the flow prefix from a role.
 * - STORE_ADMIN  → 'STORE'
 * - STORE_USER   → 'STORE'
 * - PRODUCT_ADMIN → 'PRODUCT'
 * - ANOMALY_ADMIN → null (special role with no flow)
 *
 * Works generically: everything before the last underscore segment is the flow.
 */
export function getFlowFromRole(role: Role): string | null {
  if (isAnomalyAdmin(role)) return null;

  const parts = role.split('_');
  // Last segment is the type (ADMIN or USER); everything before is the flow.
  // e.g. STORE_ADMIN → ['STORE', 'ADMIN'] → flow = 'STORE'
  // e.g. MY_CUSTOM_ADMIN → ['MY', 'CUSTOM', 'ADMIN'] → flow = 'MY_CUSTOM'
  return parts.slice(0, -1).join('_');
}

/**
 * Returns all Role enum values that belong to a given flow.
 * e.g. getRolesForFlow('STORE') → [Role.STORE_ADMIN, Role.STORE_USER]
 *
 * Used by FLOW_ADMIN permission checks to validate that an action
 * is scoped to its own flow.
 */
export function getRolesForFlow(flow: string): Role[] {
  return Object.values(Role).filter(
    (role) => getFlowFromRole(role) === flow,
  );
}

/**
 * Returns all flow-level ADMIN roles (excludes ANOMALY_ADMIN).
 * Reads the Role enum dynamically — no manual updates needed when adding flows.
 *
 * e.g. getAllFlowAdminRoles() → [Role.STORE_ADMIN, Role.PRODUCT_ADMIN]
 *
 * Used by @AdminRoles() so that adding ORDER_ADMIN to the enum automatically
 * includes it in every admin-guarded route.
 */
export function getAllFlowAdminRoles(): Role[] {
  return Object.values(Role).filter(
    (role) => isAdminRole(role) && !isAnomalyAdmin(role),
  );
}

/**
 * Checks whether a target role belongs to the same flow as the requester's
 * admin role. Used to validate FLOW_ADMIN scope.
 *
 * e.g. canAdminManageRole(Role.STORE_ADMIN, Role.STORE_USER) → true
 *      canAdminManageRole(Role.STORE_ADMIN, Role.PRODUCT_USER) → false
 *      canAdminManageRole(Role.STORE_ADMIN, Role.ANOMALY_ADMIN) → false
 */
export function canAdminManageRole(
  adminRole: Role,
  targetRole: Role,
): boolean {
  // ANOMALY_ADMIN can manage everything (but this util is for flow checks)
  if (isAnomalyAdmin(adminRole)) return true;
  // No one other than ANOMALY_ADMIN can assign ANOMALY_ADMIN
  if (isAnomalyAdmin(targetRole)) return false;

  return getFlowFromRole(adminRole) === getFlowFromRole(targetRole);
}

/**
 * Asserts that the requester has permission to act on all the given target roles.
 *
 * Rules:
 *  1. ANOMALY_ADMIN can act on anything.
 *  2. Only ANOMALY_ADMIN can act on the ANOMALY_ADMIN role.
 *  3. FLOW_ADMIN can only act on roles within their own flow.
 *  4. Non-admins cannot act at all.
 *
 * Throws ForbiddenException if any rule is violated.
 * Used by both UsersService and PermissionRequestsService to avoid duplication.
 */
export function assertAdminCanManageRoles(
  requesterRoles: Role[],
  targetRoles: Role[],
  action: string,
): void {
  if (requesterRoles.includes(Role.ANOMALY_ADMIN)) return;

  const adminRoles = requesterRoles.filter(
    (r) => isAdminRole(r) && !isAnomalyAdmin(r),
  );

  if (adminRoles.length === 0) {
    throw new ForbiddenException(`You must be an admin to ${action} roles`);
  }

  for (const targetRole of targetRoles) {
    if (isAnomalyAdmin(targetRole)) {
      throw new ForbiddenException(
        `Only ANOMALY_ADMIN can ${action} the ANOMALY_ADMIN role`,
      );
    }

    const canAct = adminRoles.some((adminRole) =>
      canAdminManageRole(adminRole, targetRole),
    );

    if (!canAct) {
      const targetFlow = getFlowFromRole(targetRole);
      throw new ForbiddenException(
        `You do not have admin access to the ${targetFlow} flow`,
      );
    }
  }
}
