import { createPortal } from "react-dom";
import Button from "@mui/material/Button";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { RoleSubmissionsTable } from "./table/RoleSubmissionsTable";
import {
  RequestsContent,
  ScopeFiltersRow,
} from "./table/RoleSubmissionsTable.style";
import { CreateRoleSubmissionDialog } from "./CreateRoleSubmissionDialog";
import { RoleSubmissionsScopeTabs } from "./RoleSubmissionsScopeTabs";
import { RoleSubmissionsStatusChips } from "./RoleSubmissionsStatusChips";
import { SearchAndFilterControls } from "../shared/SearchAndFilterControls";
import type { PermissionRequestsViewModel } from "./view.types";

interface PermissionRequestsViewProps {
  toolbarContainer: HTMLDivElement | null;
  viewModel: PermissionRequestsViewModel;
}

export const PermissionRequestsView = ({
  toolbarContainer,
  viewModel,
}: PermissionRequestsViewProps) => {
  const toolbarActions = (
    <>
      <SearchAndFilterControls
        key={viewModel.scope}
        dialogTitle="Filter Permission Requests"
        {...viewModel.filters}
      />
      <Button
        color="secondary"
        variant="contained"
        size="small"
        startIcon={<AddCircleOutlineIcon fontSize="small" />}
        onClick={viewModel.openCreateDialog}
      >
        Request permission
      </Button>
    </>
  );

  return (
    <>
      {toolbarContainer && createPortal(toolbarActions, toolbarContainer)}
      <RequestsContent>
        <ScopeFiltersRow direction="row" spacing={3} alignItems="center">
          {viewModel.isAdmin && (
            <RoleSubmissionsScopeTabs
              scope={viewModel.scope}
              onScopeChange={viewModel.changeScope}
            />
          )}
          {viewModel.statuses.length > 0 && (
            <RoleSubmissionsStatusChips
              statuses={viewModel.statuses}
              onStatusDelete={viewModel.removeStatus}
            />
          )}
        </ScopeFiltersRow>
        <RequestsContent
          role={viewModel.isAdmin ? "tabpanel" : undefined}
          id="request-scope-panel"
          aria-labelledby={
            viewModel.isAdmin ? `request-scope-${viewModel.scope}` : undefined
          }
        >
          <RoleSubmissionsTable {...viewModel.table} />
        </RequestsContent>
      </RequestsContent>
      <CreateRoleSubmissionDialog {...viewModel.createDialog} />
    </>
  );
};
