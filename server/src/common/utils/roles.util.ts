import { ForbiddenException } from '@nestjs/common';

/**
 * Central Role enum — single source of truth for all roles in the system.
 *
 * Naming convention: {FLOW}_{TYPE}
 *   - FLOW: uppercase string identifying the feature area (e.g. STORE, PRODUCT)
 *   - TYPE: either ADMIN or USER
 * 
 * note: the firxt index must be the name of the flow
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
 * exampel:
 * - STORE_ADMIN  → 'STORE'
 * - ANOMALY_ADMIN → null (special role with no flow)
 *
 * Works generically: everything before the last underscore segment is the flow.
 */
export function getFlowFromRole(role: Role): string | null {
  if (isAnomalyAdmin(role)) return null;
  const parts = role.split('_');
  
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
 * Asserts that the requester is ANOMALY_ADMIN.
 * Used on endpoints that are no longer open to FLOW_ADMIN, even within their own flow.
 *
 * Throws ForbiddenException if the requester lacks ANOMALY_ADMIN.
 */
export function assertIsAnomalyAdmin(requesterRoles: Role[], action: string): void {
  if (!requesterRoles.includes(Role.ANOMALY_ADMIN)) {
    throw new ForbiddenException(`Only ANOMALY_ADMIN can ${action}`);
  }
}
