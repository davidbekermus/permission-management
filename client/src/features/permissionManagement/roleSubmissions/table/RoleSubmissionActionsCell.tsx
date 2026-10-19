import { useState } from 'react'
import TableCell from '@mui/material/TableCell'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import type { SubmissionActions } from './action.types'
import { DeleteRoleSubmissionDialog } from './DeleteRoleSubmissionDialog'
import { ActionButtons } from './RoleSubmissionsTable.style'
import type { RoleSubmission } from '../types'

interface RoleSubmissionActionsCellProps {
  submission: RoleSubmission
  actions: SubmissionActions
  showReviewActions: boolean
}

export const RoleSubmissionActionsCell = ({ submission, actions, showReviewActions }: RoleSubmissionActionsCellProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const handleDelete = async () => {
    if (await actions.onDelete()) setDeleteDialogOpen(false)
  }

  return (
    <TableCell align="right">
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {showReviewActions && (
          <ActionButtons>
            <Button size="small" variant="contained" color="success" disabled={!actions.canApprove || actions.isPending} onClick={actions.onApprove}>
              Approve
            </Button>
            <Button size="small" variant="outlined" color="error" disabled={!actions.canReject || actions.isPending} onClick={actions.onReject}>
              Reject
            </Button>
          </ActionButtons>
        )}
        {actions.canDelete && (
          <Tooltip title="Delete permission request">
            <span>
              <IconButton size="small" color="error" aria-label="Delete permission request" disabled={actions.isPending} onClick={() => setDeleteDialogOpen(true)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>
      <DeleteRoleSubmissionDialog
        open={deleteDialogOpen}
        role={submission.role}
        isPending={actions.isDeleting}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </TableCell>
  )
}
