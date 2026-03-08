import { useState } from 'react'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import Alert from '@mui/material/Alert'
import { styled } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import Tooltip from '@mui/material/Tooltip'
import { useUsers, useAssignRole, useRemoveRole } from './useUsers'
import { UserRoleChip } from './UserRoleChip'
import { useAuth } from '@/app/providers/AuthProvider'
import { ALL_ROLES, type Role } from '@/features/auth/types'

const AssignRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  marginTop: theme.spacing(1),
}))

const EmptyRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
}))

function getFlowFromRole(role: Role): string | null {
  if (role === 'ANOMALY_ADMIN') return null
  return role.split('_')[0]
}

interface UsersTableProps {
  search?: string
  roleFilters?: Role[]
  sort?: 'latest' | 'oldest'
}

export function UsersTable({ search, roleFilters = [], sort = 'latest' }: UsersTableProps) {
  const { roles: myRoles, isAnomalyAdmin, isFlowAdmin } = useAuth()
  const [assigningFor, setAssigningFor] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | ''>('')

  const { data: users = [], isLoading, isError } = useUsers({ search, roles: roleFilters, sort })
  const assignRole = useAssignRole()
  const removeRole = useRemoveRole()

  const isAdminUser = isAnomalyAdmin || myRoles.some((r) => r.endsWith('_ADMIN'))

  const canManageRole = (role: Role): boolean => {
    if (isAnomalyAdmin) return true
    const flow = getFlowFromRole(role)
    if (!flow) return false
    return isFlowAdmin(flow)
  }

  const manageableRoles = ALL_ROLES.filter(canManageRole)

  const visibleUsers = users

  const handleAssign = (username: string) => {
    if (!selectedRole) return
    assignRole.mutate(
      { username, role: selectedRole },
      { onSuccess: () => { setAssigningFor(null); setSelectedRole('') } },
    )
  }

  if (isLoading) return <CircularProgress size={24} />
  if (isError) return <Alert severity="error">Failed to load users.</Alert>

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Roles</TableCell>
            <TableCell>Date added</TableCell>
            {isAdminUser && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} sx={{ border: 0, p: 0 }}>
                <EmptyRow>
                  <Typography variant="body2">No users found</Typography>
                </EmptyRow>
              </TableCell>
            </TableRow>
          )}
          {visibleUsers.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>{user.username}</Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {user.roles.length === 0 && (
                    <Typography variant="caption" color="text.disabled">No roles</Typography>
                  )}
                  {user.roles.map((role) => (
                    <UserRoleChip key={role} role={role} />
                  ))}
                </Box>
                <Collapse in={assigningFor === user.username}>
                  {user.roles.filter(canManageRole).length > 0 && (
                    <AssignRow sx={{ flexWrap: 'wrap' }}>
                      {user.roles.filter(canManageRole).map((role) => (
                        <UserRoleChip
                          key={role}
                          role={role}
                          onDelete={() => removeRole.mutate({ username: user.username, role })}
                        />
                      ))}
                    </AssignRow>
                  )}
                  <AssignRow>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        label="Role"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as Role)}
                      >
                        {manageableRoles
                          .filter((r) => !user.roles.includes(r))
                          .map((r) => (
                            <MenuItem key={r} value={r}>
                              {r.toLowerCase().replace(/_/g, '-')}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={!selectedRole || assignRole.isPending}
                      onClick={() => handleAssign(user.username)}
                    >
                      Add
                    </Button>
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => { setAssigningFor(null); setSelectedRole('') }}
                    >
                      Cancel
                    </Button>
                  </AssignRow>
                </Collapse>
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Typography>
              </TableCell>
              {isAdminUser && (
                <TableCell align="right">
                  {assigningFor !== user.username && (() => {
                    const canAdd = manageableRoles.some((r) => !user.roles.includes(r))
                    const canRemove = user.roles.some(canManageRole)
                    const canAct = canAdd || canRemove
                    return (
                      <Tooltip title={canAct ? 'Manage roles' : 'Nothing to manage'}>
                        <span>
                          <IconButton
                            size="small"
                            disabled={!canAct}
                            onClick={() => { setAssigningFor(user.username); setSelectedRole('') }}
                            sx={{ color: canAct ? 'text.secondary' : 'action.disabled' }}
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
  )
}
