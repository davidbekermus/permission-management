import { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import {
  useAllPermissionRequests,
  useMyPermissionRequests,
  useApproveRequest,
  useRejectRequest,
} from './hooks/usePermissionRequests'
import { RoleStatusChip, OverallStatusChip } from './RequestRoleChip'
import { useAuth } from '@/app/providers/AuthProvider'
import { type Role } from '@/features/auth/types'
import { useRoleManagement } from '../hooks/useRoleManagement'
import type { PermissionRequest, RoleEntry, OverallStatus } from './types'
import type { SortOrder } from '../shared/types'
import {
  EmptyRow,
  ReviewPanel,
  ReviewRow,
  RoleChipsBox,
  EmptyTableCell,
  StyledTableContainer,
  ReviewRoleLabel,
  ActionButton,
  DoneButtonWrapper,
  ReviewIconButton,
} from './PermissionRequestsTable.style'

// Only PENDING and REJECTED entries can still be acted on — APPROVED ones are final.
// A REJECTED entry can be re-approved but cannot be rejected again (no-op), so Reject
// is only shown for PENDING entries (see the conditional in RequestRow below).
function getActionableEntries(roles: RoleEntry[]): RoleEntry[] {
  return roles.filter((r) => r.status === 'PENDING' || r.status === 'REJECTED')
}

// RequestRow is extracted as a sub-component so each row can call useApproveRequest /
// useRejectRequest independently — mutations and their pending states are per-row, not shared.
interface RequestRowProps {
  request: PermissionRequest
  isAdmin: boolean
  canManageRole: (role: Role) => boolean
  reviewingFor: string | null
  setReviewingFor: (id: string | null) => void
}

function RequestRow({ request, isAdmin, canManageRole, reviewingFor, setReviewingFor }: RequestRowProps) {
  const approve = useApproveRequest()
  const reject = useRejectRequest()

  const actionableEntries = getActionableEntries(request.roles)
  // Further scoped to roles this specific admin can manage (flow isolation)
  const manageableEntries = actionableEntries.filter((e) => canManageRole(e.role))
  const isExpanded = reviewingFor === request._id
  const canAct = isAdmin && manageableEntries.length > 0

  return (
    <TableRow>
      <TableCell>
        <Typography variant="body2" fontWeight={500}>
          {request.username}
        </Typography>
      </TableCell>

      <TableCell>
        <RoleChipsBox>
          {request.roles.map((entry) => (
            <RoleStatusChip key={entry.role} role={entry.role} status={entry.status} />
          ))}
        </RoleChipsBox>

        <Collapse in={isExpanded}>
          <ReviewPanel>
            {manageableEntries.map((entry) => (
              <ReviewRow key={entry.role}>
                <ReviewRoleLabel variant="caption">
                  {entry.role.toLowerCase().replace(/_/g, '-')}
                </ReviewRoleLabel>
                <ActionButton
                  size="small"
                  variant="contained"
                  color="success"
                  disabled={approve.isPending}
                  onClick={() => approve.mutate({ id: request._id, roles: [entry.role] })}
                >
                  Approve
                </ActionButton>
                {/* Reject only shown for PENDING — a REJECTED role can only be approved */}
                {entry.status === 'PENDING' && (
                  <ActionButton
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={reject.isPending}
                    onClick={() => reject.mutate({ id: request._id, roles: [entry.role] })}
                  >
                    Reject
                  </ActionButton>
                )}
              </ReviewRow>
            ))}
            <DoneButtonWrapper>
              <Button
                size="small"
                color="inherit"
                onClick={() => setReviewingFor(null)}
              >
                Done
              </Button>
            </DoneButtonWrapper>
          </ReviewPanel>
        </Collapse>
      </TableCell>

      <TableCell>
        <OverallStatusChip status={request.overallStatus} />
      </TableCell>

      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {new Date(request.createdAt).toLocaleDateString()}
        </Typography>
      </TableCell>

      {isAdmin && (
        <TableCell align="right">
          {!isExpanded && (
            <Tooltip title={canAct ? 'Review roles' : 'No roles to manage'}>
              <span>
                <ReviewIconButton
                  size="small"
                  $canAct={canAct}
                  disabled={!canAct}
                  aria-label={`Review permission request from ${request.username}`}
                  aria-expanded={false}
                  onClick={() => setReviewingFor(request._id)}
                >
                  <AdminPanelSettingsIcon fontSize="small" />
                </ReviewIconButton>
              </span>
            </Tooltip>
          )}
        </TableCell>
      )}
    </TableRow>
  )
}

interface PermissionRequestsTableProps {
  search?: string
  statusFilters?: OverallStatus[]
  roleFilters?: Role[]
  sort?: SortOrder
}

export function PermissionRequestsTable({
  search = '',
  statusFilters = [],
  roleFilters = [],
  sort = 'latest',
}: PermissionRequestsTableProps) {
  const { isAdmin } = useAuth()
  const { canManageRole } = useRoleManagement()
  const [reviewingFor, setReviewingFor] = useState<string | null>(null)

  const filters = { search, statuses: statusFilters, roles: roleFilters, sort }
  // Only fire the query that matches the user's role — prevents a 403 on the admin
  // endpoint for non-admins (and an unnecessary /my-requests call for admins)
  const allQuery = useAllPermissionRequests(filters, isAdmin)
  const mineQuery = useMyPermissionRequests(filters, !isAdmin)

  const { data, isLoading, isError } = isAdmin ? allQuery : mineQuery

  const requests = data ?? []
  // Admins see an extra Actions column, so the empty-state cell must span one more column
  const colSpan = isAdmin ? 5 : 4

  return (
    <>
      {isLoading && <CircularProgress size={24} />}
      {isError && <Alert severity="error">Failed to load requests.</Alert>}

      {!isLoading && !isError && (
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Requester</TableCell>
                <TableCell>Requested Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date of request</TableCell>
                {isAdmin && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 && (
                <TableRow>
                  <EmptyTableCell colSpan={colSpan}>
                    <EmptyRow>
                      <Typography variant="body2">No permission requests</Typography>
                    </EmptyRow>
                  </EmptyTableCell>
                </TableRow>
              )}
              {requests.map((req) => (
                <RequestRow
                  key={req._id}
                  request={req}
                  isAdmin={isAdmin}
                  canManageRole={canManageRole}
                  reviewingFor={reviewingFor}
                  setReviewingFor={setReviewingFor}
                />
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}
    </>
  )
}
