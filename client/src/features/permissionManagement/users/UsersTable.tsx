import { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableContainer from '@mui/material/TableContainer'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import { useGetUsers, useAssignRole, useRemoveRole } from './hooks/useUsers'
import { UserRoleChip } from './UserRoleChip'
import { canManagePermissions, isRoleInAdminScope } from '@/app/auth/auth.utils'
import { ALL_ROLES, Roles, type Role } from '../shared/roles.types'
import { filterRequestableRoles } from '../shared/role.utils'
import {
  AssignRoleRow,
  RoleChipsBox,
  StyledFormControl,
} from './UsersTable.style'
import { EmptyRow, EmptyTableCell } from '../shared/TableStyles.style'

interface UsersTableProps {
  search?: string
  roleFilters?: Role[]
  sort?: 'latest' | 'oldest'
}

export function UsersTable({ search, roleFilters = [], sort = 'latest' }: UsersTableProps) {
  const isAnomalyAdmin = canManagePermissions()
  const [assigningFor, setAssigningFor] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | ''>('')
  const [snackMessage, setSnackMessage] = useState<string | null>(null)

  const { data: users = [], isLoading, isError } = useGetUsers({ search, roles: roleFilters, sort })
  const assignRole = useAssignRole()
  const removeRole = useRemoveRole()

  // The subset of ALL_ROLES this admin is allowed to assign — used to populate the dropdown
  // this has to change in the real app to the generated type
  const manageableRoles = ALL_ROLES.filter(isRoleInAdminScope)

  const handleAssign = (username: string) => {
    if (!selectedRole) return
    assignRole.mutate(
      { username, role: selectedRole },
      { onSuccess: () => { setAssigningFor(null); setSelectedRole(''); setSnackMessage('Role assigned') } },
    )
  }

  if (isLoading) return <CircularProgress size={24} />
  if (isError) return <Alert severity="error">Failed to load users.</Alert>

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Date added</TableCell>
              {isAnomalyAdmin && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <EmptyTableCell colSpan={isAnomalyAdmin ? 4 : 3}>
                  <EmptyRow>
                    <Typography variant="body2">No users found</Typography>
                  </EmptyRow>
                </EmptyTableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>{user.username}</Typography>
                </TableCell>
                <TableCell>
                  <RoleChipsBox>
                    {user.roles.length === 0 && (
                      <Typography variant="caption" color="text.disabled">No roles</Typography>
                    )}
                    {user.roles.map((entry) => {
                      const canRemove =
                        isAnomalyAdmin &&
                        assigningFor === user.username &&
                        isRoleInAdminScope(entry.role)

                      return (
                        <UserRoleChip
                          key={entry.role}
                          role={entry.role}
                          onDelete={canRemove
                            ? () => removeRole.mutate(
                              { username: user.username, role: entry.role },
                              { onSuccess: () => setSnackMessage('Role removed') },
                            )
                            : undefined}
                        />
                      )
                    })}
                  </RoleChipsBox>
                  {/* Expanded panel — only visible when this row's Manage action button is clicked */}
                  <Collapse in={assigningFor === user.username}>
                    <AssignRoleRow>
                      {user.roles.some((e) => e.role === Roles.ANOMALY_ADMIN) ? (
                        <Typography variant="caption" color="text.secondary" fontStyle="italic">
                          This user already has the highest level of access.
                        </Typography>
                      ) : (
                        <>
                          <StyledFormControl size="small">
                            <InputLabel>Role</InputLabel>
                            <Select
                              label="Role"
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value as Role)}
                            >
                              {/* filterRequestableRoles removes roles already held and
                                  skips FLOW_USER if the user already has FLOW_ADMIN */}
                              {filterRequestableRoles(manageableRoles, user.roles.map((e) => e.role))
                                .map((role) => (
                                  <MenuItem key={role} value={role}>
                                    {role.toLowerCase().replace(/_/g, '-')}
                                  </MenuItem>
                                ))}
                            </Select>
                          </StyledFormControl>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={!selectedRole || assignRole.isPending}
                            onClick={() => handleAssign(user.username)}
                          >
                            Add
                          </Button>
                        </>
                      )}
                      <Button
                        size="small"
                        color="inherit"
                        onClick={() => { setAssigningFor(null); setSelectedRole('') }}
                      >
                        Done
                      </Button>
                    </AssignRoleRow>
                  </Collapse>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                {isAnomalyAdmin && (
                  <TableCell align="right">
                    {/* IIFE computes canAct locally to avoid hoisting these vars to row scope.
                        The button is disabled (and tooltip explains why) when there's nothing to do. */}
                    {assigningFor !== user.username && (() => {
                      const canAdd = filterRequestableRoles(manageableRoles, user.roles.map((e) => e.role)).length > 0
                      const canRemove = user.roles.some((e) => isRoleInAdminScope(e.role))
                      const canAct = canAdd || canRemove
                      return (
                        <Tooltip title={canAct ? 'Manage roles' : 'Nothing to manage'}>
                          <span>
                            <IconButton
                              size="small"
                              disabled={!canAct}
                              aria-label={`Manage roles for ${user.username}`}
                              aria-expanded={false}
                              onClick={() => { setAssigningFor(user.username); setSelectedRole('') }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )
                    })()}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* sx exception: MUI v5 Snackbar has no styled API for content background */}
      <Snackbar
        open={snackMessage !== null}
        autoHideDuration={3000}
        onClose={() => setSnackMessage(null)}
        message={snackMessage}
        ContentProps={{ sx: { backgroundColor: 'success.main' } }}
      />
    </>
  )
}
