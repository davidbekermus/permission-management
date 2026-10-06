import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableContainer from '@mui/material/TableContainer'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { useGetRoleSubmissions, type RoleSubmissionScope } from '../hooks/useRoleSubmissions'
import { RoleSubmissionRow } from './RoleSubmissionRow'
import { canManagePermissions, getCurrentUsername } from '@/app/auth/auth.utils'
import type { Roles, SortOrder } from '../../shared/types'
import { RoleSubmissionStatus } from '../types'
import { EmptyRow, EmptyTableCell } from '../../shared/TableStyles.style'

interface RoleSubmissionsTableProps {
  scope: RoleSubmissionScope
  search?: string
  statusFilters?: RoleSubmissionStatus[]
  roleFilters?: Roles[]
  sort?: SortOrder
}

export const RoleSubmissionsTable = ({ scope, search = '', statusFilters = [], roleFilters = [], sort = 'latest' }: RoleSubmissionsTableProps) => {
  const username = getCurrentUsername()
  const isAnomalyAdmin = scope === 'review' && canManagePermissions()
  const filters = { search, statuses: statusFilters, roles: roleFilters, sort }
  const { data, isLoading, isError } = useGetRoleSubmissions(filters, scope)
  const submissions = data ?? []
  const showControls = isAnomalyAdmin || submissions.some(
    (submission) => submission.username === username && submission.status === RoleSubmissionStatus.PENDING,
  )
  const colSpan = showControls ? 7 : 6

  if (isError) return <Alert severity="error">Failed to load permission requests.</Alert>

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Requester</TableCell>
            <TableCell>Requested role</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Granted by</TableCell>
            <TableCell>Date</TableCell>
            {showControls && <TableCell align="right">Manage</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && (
            <TableRow>
              <EmptyTableCell colSpan={colSpan}>
                <EmptyRow><CircularProgress /></EmptyRow>
              </EmptyTableCell>
            </TableRow>
          )}
          {!isLoading && submissions.length === 0 && (
            <TableRow>
              <EmptyTableCell colSpan={colSpan}>
                <EmptyRow><Typography variant="body2">No permission requests</Typography></EmptyRow>
              </EmptyTableCell>
            </TableRow>
          )}
          {!isLoading && submissions.map((submission) => (
            <RoleSubmissionRow
              key={submission._id}
              submission={submission}
              isAnomalyAdmin={isAnomalyAdmin}
              currentUsername={username}
              showControls={showControls}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
