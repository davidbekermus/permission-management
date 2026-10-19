import { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { InfiniteLoadingRow } from '../../shared/InfiniteLoadingRow'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import type { UserTableRow } from './row.types'
import type { TableLoadingState } from '../../shared/table.types'
import { UserActionsCell } from './UserActionsCell'
import { UserRolesCell } from './UserRolesCell'
import type { Roles } from '../../shared/types'
import { EmptyRow, EmptyTableCell, ScrollableTableContainer } from '../../shared/TableStyles.style'

interface UsersTableProps extends TableLoadingState {
  rows: UserTableRow[]
  canManage: boolean
  isAssigning: boolean
  isRemoving: boolean
  onAssignRole: (username: string, role: Roles) => Promise<boolean>
  onRemoveRole: (username: string, role: Roles) => Promise<boolean>
}

export const UsersTable = ({ rows, canManage, isAssigning, isRemoving, onAssignRole, onRemoveRole, isLoading, isError, pagination }: UsersTableProps) => {
  const [editingUsername, setEditingUsername] = useState<string | null>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  if (isError) return <Alert severity="error">Failed to load users.</Alert>

  return (
    <>
      <ScrollableTableContainer ref={setContainer}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Date added</TableCell>
              {canManage && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <EmptyTableCell colSpan={canManage ? 4 : 3}>
                  <EmptyRow><CircularProgress /></EmptyRow>
                </EmptyTableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <EmptyTableCell colSpan={canManage ? 4 : 3}>
                  <EmptyRow>
                    <Typography variant="body2">No users found</Typography>
                  </EmptyRow>
                </EmptyTableCell>
              </TableRow>
            )}
            {rows.map(({ user, availableRoles, hasHighestAccess, canManageRoles }) => (
              <TableRow key={user._id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>{user.username}</Typography>
                </TableCell>
                <UserRolesCell
                  user={user}
                  availableRoles={availableRoles}
                  hasHighestAccess={hasHighestAccess}
                  isEditing={editingUsername === user.username}
                  canManage={canManage}
                  isAssigning={isAssigning}
                  isRemoving={isRemoving}
                  onAssignRole={onAssignRole}
                  onRemoveRole={onRemoveRole}
                  onDone={() => setEditingUsername(null)}
                />
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                {canManage && (
                  <UserActionsCell
                    user={user}
                    canManageRoles={canManageRoles}
                    isEditing={editingUsername === user.username}
                    onManage={setEditingUsername}
                  />
                )}
              </TableRow>
            ))}
            <InfiniteLoadingRow
              container={container}
              colSpan={canManage ? 4 : 3}
              hasNextPage={pagination.hasNextPage}
              isFetching={pagination.isFetching}
              isError={pagination.isError}
              enabled={pagination.enabled}
              onLoadMore={pagination.onLoadMore}
            />
          </TableBody>
        </Table>
      </ScrollableTableContainer>
    </>
  )
}
