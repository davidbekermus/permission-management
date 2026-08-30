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
import Snackbar from '@mui/material/Snackbar'
import { useGetUsers } from './hooks/useUsers'
import { UserActionsCell } from './UserActionsCell'
import { UserRolesCell } from './UserRolesCell'
import { canManagePermissions, isRoleInAdminScope } from '@/app/auth/auth.utils'
import { ALL_ROLES, type Role } from '../shared/roles.types'
import { EmptyRow, EmptyTableCell } from '../shared/TableStyles.style'

interface UsersTableProps {
  search?: string
  roleFilters?: Role[]
  sort?: 'latest' | 'oldest'
}

export function UsersTable({ search, roleFilters = [], sort = 'latest' }: UsersTableProps) {
  const isAnomalyAdmin = canManagePermissions()
  const [editingUsername, setEditingUsername] = useState<string | null>(null)
  const [snackMessage, setSnackMessage] = useState<string | null>(null)

  const { data: users = [], isLoading, isError } = useGetUsers({ search, roles: roleFilters, sort })

  // The subset of ALL_ROLES this admin is allowed to assign — used to populate the dropdown
  // this has to change in the real app to the generated type
  const manageableRoles = ALL_ROLES.filter(isRoleInAdminScope)

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
                <UserRolesCell
                  user={user}
                  manageableRoles={manageableRoles}
                  isEditing={editingUsername === user.username}
                  canManage={isAnomalyAdmin}
                  onDone={() => setEditingUsername(null)}
                  onMessage={setSnackMessage}
                />
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                {isAnomalyAdmin && (
                  <UserActionsCell
                    user={user}
                    manageableRoles={manageableRoles}
                    isEditing={editingUsername === user.username}
                    onManage={setEditingUsername}
                  />
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
