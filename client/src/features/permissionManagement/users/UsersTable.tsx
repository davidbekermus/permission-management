import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Collapse from '@mui/material/Collapse'
import Alert from '@mui/material/Alert'
import { styled } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import { useUsers, useAssignRole, useRemoveRole } from './useUsers'
import { UserRoleChip } from './UserRoleChip'
import { useAuth } from '@/app/providers/AuthProvider'
import { ALL_ROLES, type Role } from '@/features/auth/types'

const ToolbarRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
}))

const AssignRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  marginTop: theme.spacing(1),
}))

function getFlowFromRole(role: Role): string | null {
  if (role === 'ANOMALY_ADMIN') return null
  return role.split('_')[0]
}

export function UsersTable() {
  const { roles: myRoles, isAnomalyAdmin, isFlowAdmin } = useAuth()
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [assigningFor, setAssigningFor] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | ''>('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data: users = [], isLoading, isError } = useUsers(debouncedSearch || undefined)
  const assignRole = useAssignRole()
  const removeRole = useRemoveRole()

  const canManageRole = (role: Role): boolean => {
    if (isAnomalyAdmin) return true
    const flow = getFlowFromRole(role)
    if (!flow) return false
    return isFlowAdmin(flow)
  }

  const managableRoles = ALL_ROLES.filter(canManageRole)

  const filteredUsers = roleFilter
    ? users.filter((u) => u.roles.includes(roleFilter))
    : users

  const handleAssign = (username: string) => {
    if (!selectedRole) return
    assignRole.mutate(
      { username, role: selectedRole },
      {
        onSuccess: () => {
          setAssigningFor(null)
          setSelectedRole('')
        },
      },
    )
  }

  // Admins see all users; non-admins see themselves
  const visibleUsers = isAnomalyAdmin || myRoles.some((r) => r.endsWith('_ADMIN'))
    ? filteredUsers
    : filteredUsers.filter((u) => u.username === myRoles[0])

  return (
    <Box>
      <ToolbarRow>
        <TextField
          label="Search username"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by role</InputLabel>
          <Select
            label="Filter by role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | '')}
          >
            <MenuItem value="">All roles</MenuItem>
            {ALL_ROLES.map((r) => (
              <MenuItem key={r} value={r}>
                {r.toLowerCase().replace(/_/g, '-')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ToolbarRow>

      {isLoading && <CircularProgress size={24} />}
      {isError && <Alert severity="error">Failed to load users.</Alert>}

      {!isLoading && !isError && (
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Date added</TableCell>
                {(isAnomalyAdmin || myRoles.some((r) => r.endsWith('_ADMIN'))) && (
                  <TableCell>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {visibleUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell sx={{ fontWeight: 500 }}>{user.username}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                      {user.roles.map((role) => (
                        <UserRoleChip
                          key={role}
                          role={role}
                          onDelete={
                            canManageRole(role)
                              ? () => removeRole.mutate({ username: user.username, role })
                              : undefined
                          }
                        />
                      ))}
                    </Box>
                    <Collapse in={assigningFor === user.username}>
                      <AssignRow>
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                          <InputLabel>Role</InputLabel>
                          <Select
                            label="Role"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as Role)}
                          >
                            {managableRoles
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
                          onClick={() => { setAssigningFor(null); setSelectedRole('') }}
                        >
                          Cancel
                        </Button>
                      </AssignRow>
                    </Collapse>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  {(isAnomalyAdmin || myRoles.some((r) => r.endsWith('_ADMIN'))) && (
                    <TableCell>
                      {managableRoles.length > 0 && assigningFor !== user.username && (
                        <IconButton
                          size="small"
                          onClick={() => { setAssigningFor(user.username); setSelectedRole('') }}
                          title="Assign role"
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
