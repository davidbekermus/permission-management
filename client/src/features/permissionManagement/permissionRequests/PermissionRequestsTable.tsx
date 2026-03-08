import { useState } from 'react'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import { styled } from '@mui/material/styles'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import {
  useAllPermissionRequests,
  useMyPermissionRequests,
  useApproveRequest,
  useRejectRequest,
} from './usePermissionRequests'
import { RoleStatusChip, OverallStatusChip } from './RequestRoleChip'
import { useAuth } from '@/app/providers/AuthProvider'
import type { PermissionRequest, RoleEntry, OverallStatus } from './types'
import type { Role } from '@/features/auth/types'
import type { SortOrder } from '../users/FilterDialog'

const EmptyRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
}))

const ReviewPanel = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.75),
  marginTop: theme.spacing(1.5),
  paddingTop: theme.spacing(1.5),
  borderTop: `1px solid ${theme.palette.divider}`,
}))

const ReviewRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}))

function getFlowFromRole(role: Role): string | null {
  if (role === 'ANOMALY_ADMIN') return null
  return role.split('_')[0]
}

function getActionableEntries(roles: RoleEntry[]): RoleEntry[] {
  return roles.filter((r) => r.status === 'PENDING' || r.status === 'REJECTED')
}

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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {request.roles.map((entry) => (
            <RoleStatusChip key={entry.role} role={entry.role} status={entry.status} />
          ))}
        </Box>

        <Collapse in={isExpanded}>
          <ReviewPanel>
            {manageableEntries.map((entry) => (
              <ReviewRow key={entry.role}>
                <Typography variant="caption" sx={{ minWidth: 120, color: 'text.secondary' }}>
                  {entry.role.toLowerCase().replace(/_/g, '-')}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  disabled={approve.isPending}
                  onClick={() => approve.mutate({ id: request._id, roles: [entry.role] })}
                  sx={{ minWidth: 80 }}
                >
                  Approve
                </Button>
                {entry.status === 'PENDING' && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={reject.isPending}
                    onClick={() => reject.mutate({ id: request._id, roles: [entry.role] })}
                    sx={{ minWidth: 80 }}
                  >
                    Reject
                  </Button>
                )}
              </ReviewRow>
            ))}
            <Box sx={{ mt: 0.5 }}>
              <Button
                size="small"
                color="inherit"
                onClick={() => setReviewingFor(null)}
              >
                Done
              </Button>
            </Box>
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
                <IconButton
                  size="small"
                  disabled={!canAct}
                  onClick={() => setReviewingFor(request._id)}
                  sx={{ color: canAct ? 'text.secondary' : 'action.disabled' }}
                >
                  <AdminPanelSettingsIcon fontSize="small" />
                </IconButton>
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
  const { isAdmin, isAnomalyAdmin, isFlowAdmin } = useAuth()
  const [reviewingFor, setReviewingFor] = useState<string | null>(null)

  const filters = { search, statuses: statusFilters, roles: roleFilters, sort }
  const allQuery = useAllPermissionRequests(filters)
  const mineQuery = useMyPermissionRequests(filters)

  const { data, isLoading, isError } = isAdmin ? allQuery : mineQuery

  const canManageRole = (role: Role): boolean => {
    if (isAnomalyAdmin) return true
    const flow = getFlowFromRole(role)
    if (!flow) return false
    return isFlowAdmin(flow)
  }

  const requests = data ?? []

  const colSpan = isAdmin ? 5 : 4

  return (
    <Box>
      {isLoading && <CircularProgress size={24} />}
      {isError && <Alert severity="error">Failed to load requests.</Alert>}

      {!isLoading && !isError && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Requester</TableCell>
                <TableCell>Requested Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                {isAdmin && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={colSpan} sx={{ border: 0, p: 0 }}>
                    <EmptyRow>
                      <Typography variant="body2">No permission requests</Typography>
                    </EmptyRow>
                  </TableCell>
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
        </TableContainer>
      )}
    </Box>
  )
}
