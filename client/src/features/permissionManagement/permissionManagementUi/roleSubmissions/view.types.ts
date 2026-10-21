import type { ComponentProps } from "react";
import type { RoleSubmissionsTable } from "./table/RoleSubmissionsTable";
import type { CreateRoleSubmissionDialog } from "./CreateRoleSubmissionDialog";
import type { SearchAndFilterControls } from "../shared/SearchAndFilterControls";
import type { RoleSubmissionScope, RoleSubmissionStatus } from "./types";

export interface PermissionRequestsViewModel {
  isAdmin: boolean;
  scope: RoleSubmissionScope;
  statuses: RoleSubmissionStatus[];
  changeScope: (scope: RoleSubmissionScope) => void;
  openCreateDialog: () => void;
  removeStatus: (status: RoleSubmissionStatus) => void;
  filters: Omit<
    ComponentProps<typeof SearchAndFilterControls<RoleSubmissionStatus>>,
    "dialogTitle"
  >;
  table: ComponentProps<typeof RoleSubmissionsTable>;
  createDialog: ComponentProps<typeof CreateRoleSubmissionDialog>;
}
