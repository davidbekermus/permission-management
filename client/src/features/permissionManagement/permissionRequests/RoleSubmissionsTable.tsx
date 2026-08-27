import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import {
  useAllRoleSubmissions,
  useMyRoleSubmissions,
  useApproveRoleSubmission,
  useRejectRoleSubmission,
} from './hooks/useRoleSubmissions'
import { RoleChip, RoleSubmissionStatusChip } from './RoleSubmissionChip'
import { useAuth } from '@/app/providers/AuthProvider'
import { type Role } from '@/features/auth/types'
import { useRoleManagement } from '../hooks/useRoleManagement'
import type { RoleSubmission, RoleSubmissionStatus } from './types'
import type { SortOrder } from '../shared/types'
import {
  EmptyRow,
  EmptyTableCell,
  StyledTableContainer,
  ActionButton,
} from './RoleSubmissionsTable.style'

interface RoleSubmissionRowProps {
  submission: RoleSubmission
  isAdmin: boolean
  isAnomalyAdmin: boolean
  canManageRole: (role: Role) => boolean
}

function RoleSubmissionRow({ submission, isAdmin, isAnomalyAdmin, canManageRole }: RoleSubmissionRowProps) {
  const approve = useApproveRoleSubmission()
  const reject = useRejectRoleSubmission()
  const canApprove = isAnomalyAdmin && canManageRole(submission.role) && ['PENDING', 'REJECTED'].includes(submission.status)
  const canReject = isAnomalyAdmin && canManageRole(submission.role) && submission.status === 'PENDING'

  return (
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
      {isAdmin && (
        <TableCell align="right">
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <ActionButton
              size="small"
              variant="contained"
              color="success"
              disabled={!canApprove || approve.isPending}
              onClick={() => approve.mutate(submission._id)}
            >
              Approve
            </ActionButton>
            <ActionButton
              size="small"
              variant="outlined"
              color="error"
              disabled={!canReject || reject.isPending}
              onClick={() => reject.mutate(submission._id)}
            >
              Reject
            </ActionButton>
          </Stack>
        </TableCell>
      )}
    </TableRow>
  )
}

interface RoleSubmissionsTableProps {
  search?: string
  statusFilters?: RoleSubmissionStatus[]
  roleFilters?: Role[]
  sort?: SortOrder
}

export function RoleSubmissionsTable({
  search = '',
  statusFilters = [],
  roleFilters = [],
  sort = 'latest',
}: RoleSubmissionsTableProps) {
  const { isAdmin, isAnomalyAdmin } = useAuth()
  const { canManageRole } = useRoleManagement()
  const filters = { search, statuses: statusFilters, roles: roleFilters, sort }
  const allQuery = useAllRoleSubmissions(filters, isAdmin)
  const mineQuery = useMyRoleSubmissions(filters, !isAdmin)
  const { data, isLoading, isError } = isAdmin ? allQuery : mineQuery
  const submissions = data ?? []
  const colSpan = isAdmin ? 6 : 5

  return (
    <>
      {isLoading && <CircularProgress size={24} />}
      {isError && <Alert severity="error">Failed to load permission requests.</Alert>}

      {!isLoading && !isError && (
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Requester</TableCell>
                <TableCell>Requested role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Granted by</TableCell>
                <TableCell>Date</TableCell>
                {isAdmin && <TableCell align="right">Actions</TableCell>}
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
                  isAdmin={isAdmin}
                  isAnomalyAdmin={isAnomalyAdmin}
                  canManageRole={canManageRole}
                />
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}
    </>
  )
}
