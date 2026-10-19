import { createPortal } from 'react-dom'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { RoleSubmissionsTable } from './table/RoleSubmissionsTable'
import { RequestsContent } from './table/RoleSubmissionsTable.style'
import { CreateRoleSubmissionDialog } from './CreateRoleSubmissionDialog'
import { RoleSubmissionsScopeTabs } from './RoleSubmissionsScopeTabs'
import { RoleSubmissionsStatusChips } from './RoleSubmissionsStatusChips'
import { SearchAndFilterControls } from '../shared/SearchAndFilterControls'
import { useRoleSubmissionsView } from './hooks/useRoleSubmissionsView'

interface PermissionRequestsViewProps {
  toolbarContainer: HTMLDivElement | null
}

export const PermissionRequestsView = ({ toolbarContainer }: PermissionRequestsViewProps) => {
  const view = useRoleSubmissionsView()
  const toolbarActions = (
    <>
      <SearchAndFilterControls
        key={view.scope}
        dialogTitle="Filter Permission Requests"
        {...view.filters}
      />
      <Button color="secondary"
        variant="contained"
        size="small"
        startIcon={<AddCircleOutlineIcon fontSize="small" />}
        onClick={view.openCreateDialog}
      >
        Request permission
      </Button>
    </>
  )

  return (
    <>
      {toolbarContainer && createPortal(toolbarActions, toolbarContainer)}
      <RequestsContent>
        <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 2 }}>
          {view.isAdmin && (
            <RoleSubmissionsScopeTabs scope={view.scope} onScopeChange={view.changeScope} />
          )}
          {view.isAdmin && view.statuses.length > 0 && (
            <RoleSubmissionsStatusChips
              statuses={view.statuses}
              onStatusDelete={view.removeStatus}
            />
          )}
        </Stack>
        <RequestsContent
          role={view.isAdmin ? 'tabpanel' : undefined}
          id="request-scope-panel"
          aria-labelledby={view.isAdmin ? `request-scope-${view.scope}` : undefined}
        >
          <RoleSubmissionsTable {...view.table} />
        </RequestsContent>
      </RequestsContent>
      <CreateRoleSubmissionDialog {...view.createDialog} />
    </>
  )
}
