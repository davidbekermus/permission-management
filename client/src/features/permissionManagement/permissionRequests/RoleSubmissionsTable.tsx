import { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableContainer from '@mui/material/TableContainer'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useSnackbar } from 'notistack'
import {
  useAllRoleSubmissions,
  useMyRoleSubmissions,
  useApproveRoleSubmission,
  useRejectRoleSubmission,
  useDeleteRoleSubmission,
} from './hooks/useRoleSubmissions'
import { RoleChip, RoleSubmissionStatusChip } from './RoleSubmissionChip'
import {
  canManagePermissions,
  canReadPermissionManagement,
  getCurrentUsername,
} from '@/app/auth/auth.utils'
import type { Roles, SortOrder } from '../shared/types'
import type { RoleSubmission, RoleSubmissionStatus } from './types'
import {
  ActionButton,
} from './RoleSubmissionsTable.style'
import { EmptyRow, EmptyTableCell } from '../shared/TableStyles.style'

interface RoleSubmissionRowProps {
  submission: RoleSubmission
  isAnomalyAdmin: boolean
  currentUsername: string | null
  showActions: boolean
}

function RoleSubmissionRow({
  submission,
  isAnomalyAdmin,
  currentUsername,
  showActions,
}: RoleSubmissionRowProps) {
  const { enqueueSnackbar } = useSnackbar()
  const approve = useApproveRoleSubmission()
  const reject = useRejectRoleSubmission()
  const remove = useDeleteRoleSubmission()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const canApprove = isAnomalyAdmin && ['PENDING', 'REJECTED'].includes(submission.status)
  const canReject = isAnomalyAdmin && submission.status === 'PENDING'
  const canDeleteOwn = submission.username === currentUsername && submission.status === 'PENDING'

  const handleDelete = () => {
    remove.mutate(submission._id, {
      onSuccess: () => {
        enqueueSnackbar('Permission request deleted', { variant: 'success' })
        setDeleteOpen(false)
      },
      onError: () => enqueueSnackbar('Failed to delete permission request', { variant: 'error' }),
    })
  }

  return (
    <>
      <TableRow>
      <TableCell>
        <Typography variant="body2" fontWeight={500}>
          {submission.username}
        </Typography>
      </TableCell>
      <TableCell>
        <RoleChip role={submission.role} />
      </TableCell>
      <TableCell>
        <RoleSubmissionStatusChip status={submission.status} />
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {submission.grantedBy ?? '-'}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {new Date(submission.grantedAt ?? submission.createdAt).toLocaleDateString()}
        </Typography>
      </TableCell>
      {showActions && (
        <TableCell align="right">
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {isAnomalyAdmin && (
              <>
                <ActionButton
                  size="small"
                  variant="contained"
                  color="success"
                  disabled={!canApprove || approve.isPending}
                  onClick={() => approve.mutate(submission._id, {
                    onSuccess: () => enqueueSnackbar('Permission request approved', { variant: 'success' }),
                    onError: () => enqueueSnackbar('Failed to approve permission request', { variant: 'error' }),
                  })}
                >
                  Approve
                </ActionButton>
                <ActionButton
                  size="small"
                  variant="outlined"
                  color="error"
                  disabled={!canReject || reject.isPending}
                  onClick={() => reject.mutate(submission._id, {
                    onSuccess: () => enqueueSnackbar('Permission request rejected', { variant: 'success' }),
                    onError: () => enqueueSnackbar('Failed to reject permission request', { variant: 'error' }),
                  })}
                >
                  Reject
                </ActionButton>
              </>
            )}
            {canDeleteOwn && (
              <Tooltip title="Delete permission request">
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Delete permission request"
                  onClick={() => setDeleteOpen(true)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </TableCell>
      )}
      </TableRow>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs">
        <DialogTitle>Delete permission request?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This will permanently delete your pending request for {submission.role.toLowerCase().replace(/_/g, '-')}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={remove.isPending}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

interface RoleSubmissionsTableProps {
  search?: string
  statusFilters?: RoleSubmissionStatus[]
  roleFilters?: Roles[]
  sort?: SortOrder
}

export function RoleSubmissionsTable({
  search = '',
  statusFilters = [],
  roleFilters = [],
  sort = 'latest',
}: RoleSubmissionsTableProps) {
  const username = getCurrentUsername()
  const isAdmin = canReadPermissionManagement()
  const isAnomalyAdmin = canManagePermissions()
  const filters = { search, statuses: statusFilters, roles: roleFilters, sort }
  const allQuery = useAllRoleSubmissions(filters, isAdmin)
  const mineQuery = useMyRoleSubmissions(filters, !isAdmin)
  const { data, isLoading, isError } = isAdmin ? allQuery : mineQuery
  const submissions = data ?? []
  const showActions = isAnomalyAdmin || (!isAdmin && username !== null)
  const colSpan = showActions ? 6 : 5

  return (
    <>
      {isLoading && <CircularProgress size={24} />}
      {isError && <Alert severity="error">Failed to load permission requests.</Alert>}

      {!isLoading && !isError && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Requester</TableCell>
                <TableCell>Requested role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Granted by</TableCell>
                <TableCell>Date</TableCell>
                {showActions && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length === 0 && (
                <TableRow>
                  <EmptyTableCell colSpan={colSpan}>
                    <EmptyRow>
                      <Typography variant="body2">No permission requests</Typography>
                    </EmptyRow>
                  </EmptyTableCell>
                </TableRow>
              )}
              {submissions.map((submission) => (
                <RoleSubmissionRow
                  key={submission._id}
                  submission={submission}
                  isAnomalyAdmin={isAnomalyAdmin}
                  currentUsername={username}
                  showActions={showActions}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}
