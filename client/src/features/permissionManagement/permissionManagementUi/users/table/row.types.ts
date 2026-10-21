import type { User } from "../types";
import type { Roles } from "../../shared/types";

export interface UserTableRow {
  user: User;
  availableRoles: Roles[];
  hasHighestAccess: boolean;
  canManageRoles: boolean;
}
