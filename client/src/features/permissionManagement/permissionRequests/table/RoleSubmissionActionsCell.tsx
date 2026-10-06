import { useState } from 'react'
import TableCell from '@mui/material/TableCell'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useSnackbar } from 'notistack'
import {
  useApproveRoleSubmission,
  useDeleteRoleSubmission,
  useRejectRoleSubmission,
} from '../hooks/useRoleSubmissions'
import { DeleteRoleSubmissionDialog } from './DeleteRoleSubmissionDialog'
import { ActionButtons } from './RoleSubmissionsTable.style'
import { RoleSubmissionStatus, type RoleSubmission } from '../types'

interface RoleSubmissionActionsCellProps {
  submission: RoleSubmission
  isAnomalyAdmin: boolean
  currentUsername: string | null
}

export function RoleSubmissionActionsCell({
  submission,
  isAnomalyAdmin,
  currentUsername,
}: RoleSubmissionActionsCellProps) {
  const { enqueueSnackbar } = useSnackbar()
  const approve = useApproveRoleSubmission()
  const reject = useRejectRoleSubmission()
  const remove = useDeleteRoleSubmission()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const canApprove = isAnomalyAdmin && [
    RoleSubmissionStatus.PENDING,
    RoleSubmissionStatus.REJECTED,
  ].includes(submission.status)
  const canReject = isAnomalyAdmin && submission.status === RoleSubmissionStatus.PENDING
  const canDeleteOwn = submission.username === currentUsername && submission.status === RoleSubmissionStatus.PENDING
  const isActionPending = approve.isPending || reject.isPending || remove.isPending

  const handleApprove = () => {
    approve.mutate(submission._id, {
      onSuccess: () => enqueueSnackbar('Permission request approved', { variant: 'success' }),
      onError: () => enqueueSnackbar('Failed to approve permission request', { variant: 'error' }),
    })
  }

  const handleReject = () => {
    reject.mutate(submission._id, {
      onSuccess: () => enqueueSnackbar('Permission request rejected', { variant: 'success' }),
      onError: () => enqueueSnackbar('Failed to reject permission request', { variant: 'error' }),
    })
  }

  const handleDelete = () => {
    remove.mutate(submission._id, {
      onSuccess: () => {
        enqueueSnackbar('Permission request deleted', { variant: 'success' })
        setDeleteDialogOpen(false)
      },
      onError: () => enqueueSnackbar('Failed to delete permission request', { variant: 'error' }),
    })
  }

  return (
    <TableCell align="right">
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {isAnomalyAdmin && (
          <ActionButtons>
            <Button size="small" variant="contained" color="success" disabled={!canApprove || isActionPending} onClick={handleApprove}>
              Approve
            </Button>
            <Button size="small" variant="outlined" color="error" disabled={!canReject || isActionPending} onClick={handleReject}>
              Reject
            </Button>
          </ActionButtons>
        )}
        {canDeleteOwn && (
          <Tooltip title="Delete permission request">
            <span>
              <IconButton size="small" color="error" aria-label="Delete permission request" disabled={isActionPending} onClick={() => setDeleteDialogOpen(true)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>
      <DeleteRoleSubmissionDialog
        open={deleteDialogOpen}
        role={submission.role}
        isPending={remove.isPending}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </TableCell>
  )
}
