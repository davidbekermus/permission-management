import type { ComponentProps } from "react";
import type { UsersTable } from "./table/UsersTable";
import type { AddUserDialog } from "./AddUserDialog";
import type { SearchAndFilterControls } from "../shared/SearchAndFilterControls";

export interface UsersViewModel {
  canManage: boolean;
  openAddUser: () => void;
  filters: Omit<
    ComponentProps<typeof SearchAndFilterControls<never>>,
    "dialogTitle"
  >;
  table: ComponentProps<typeof UsersTable>;
  addUserDialog: ComponentProps<typeof AddUserDialog>;
}
