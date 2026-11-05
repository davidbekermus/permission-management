import { createPortal } from "react-dom";
import Button from "@mui/material/Button";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { UsersTable } from "./table/UsersTable";
import { AddUserDialog } from "./AddUserDialog";
import { SearchAndFilterControls } from "../shared/SearchAndFilterControls";
import type { UsersViewModel } from "./view.types";

interface UsersViewProps {
  toolbarContainer: HTMLDivElement | null;
viewModel: UsersViewModel;
}

export const UsersView = ({ toolbarContainer, viewModel }: UsersViewProps) => {
  const toolbarActions = (
    <>
      <SearchAndFilterControls dialogTitle="Filter Users" {...viewModel.filters} />
      {viewModel.canManage && (
        <Button
          color="secondary"
          variant="contained"
          size="small"
          startIcon={<PersonAddIcon fontSize="small" />}
          onClick={viewModel.openAddUser}
        >
          Add user
        </Button>
      )}
    </>
  );

  return (
    <>
      {toolbarContainer && createPortal(toolbarActions, toolbarContainer)}
      <UsersTable {...viewModle.table} />
      <AddUserDialog {...viewModel.addUserDialog} />
    </>
  );
};
