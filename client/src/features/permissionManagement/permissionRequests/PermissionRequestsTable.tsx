import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { styled } from '@mui/material/styles'
import {
  useAllPermissionRequests,
  useMyPermissionRequests,
  useApproveRequest,
  useRejectRequest,
} from './usePermissionRequests'
import { RoleStatusChip, OverallStatusChip } from './RequestRoleChip'
import { CreateRequestForm } from './CreateRequestForm'
import { useAuth } from '@/app/providers/AuthProvider'
import type { PermissionRequest, RoleEntry } from './types'
import type { Role } from '@/features/auth/types'

const ActionCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  flexWrap: 'wrap',
}))

function getPendingRoles(roles: RoleEntry[]): Role[] {
  return roles.filter((r) => r.status === 'PENDING').map((r) => r.role)
}

function getApprovedRoles(roles: RoleEntry[]): Role[] {
  return roles.filter((r) => r.status === 'APPROVED').map((r) => r.role)
}

interface RequestRowProps {
  request: PermissionRequest
  isAdmin: boolean
}

function RequestRow({ request, isAdmin }: RequestRowProps) {
  const approve = useApproveRequest()
  const reject = useRejectRequest()
  const pendingRoles = getPendingRoles(request.roles)
  const approvedRoles = getApprovedRoles(request.roles)

  return (
    <TableRow>
      <TableCell sx={{ fontWeight: 500 }}>{request.username}</TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {request.roles.map((entry) => (
            <RoleStatusChip key={entry.role} role={entry.role} status={entry.status} />
          ))}
        </Box>
      </TableCell>
      <TableCell>
        <OverallStatusChip status={request.overallStatus} />
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {approvedRoles.map((r) => (
            <RoleStatusChip key={r} role={r} status="APPROVED" />
          ))}
          {approvedRoles.length === 0 && (
            <Typography variant="caption" color="text.secondary">—</Typography>
          )}
        </Box>
      </TableCell>
      <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
        {new Date(request.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
        {request.updatedAt !== request.createdAt
          ? new Date(request.updatedAt).toLocaleDateString()
          : '—'}
      </TableCell>
      {isAdmin && (
        <TableCell>
          {pendingRoles.length > 0 && (
            <ActionCell>
              <Button
                size="small"
                variant="contained"
                color="success"
                disabled={approve.isPending}
                onClick={() => approve.mutate({ id: request._id, roles: pendingRoles })}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={reject.isPending}
                onClick={() => reject.mutate({ id: request._id, roles: pendingRoles })}
              >
                Reject
              </Button>
            </ActionCell>
          )}
        </TableCell>
      )}
    </TableRow>
  )
}

export function PermissionRequestsTable() {
  const { isAdmin } = useAuth()

  const allQuery = useAllPermissionRequests()
  const mineQuery = useMyPermissionRequests()

  const { data, isLoading, isError } = isAdmin ? allQuery : mineQuery

  const requests = [...(data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <Box>
      {!isAdmin && <CreateRequestForm />}

      {isLoading && <CircularProgress size={24} />}
      {isError && <Alert severity="error">Failed to load requests.</Alert>}

      {!isLoading && !isError && (
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Requester</TableCell>
                <TableCell>Requested roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Accepted roles</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                {isAdmin && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 2, textAlign: 'center' }}
                    >
                      No permission requests
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {requests.map((req) => (
                <RequestRow key={req._id} request={req} isAdmin={isAdmin} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
