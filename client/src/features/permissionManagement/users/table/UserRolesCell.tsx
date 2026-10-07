import { useEffect, useState } from 'react'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import { useSnackbar } from 'notistack'
import { useAssignRole, useRemoveRole } from '../hooks/useUsers'
import { UserRoleChip } from './UserRoleChip'
import { Roles } from '../../shared/types'
import { filterRequestableRoles, formatRole } from '../../shared/role.utils'
import { AssignRoleRow, RoleChipsBox, StyledFormControl } from './UsersTable.style'
import type { User } from '../types'

interface UserRolesCellProps {
  user: User
  manageableRoles: Roles[]
  isEditing: boolean
  canManage: boolean
  onDone: () => void
}

export function UserRolesCell({
  user,
  manageableRoles,
  isEditing,
  canManage,
  onDone,
}: UserRolesCellProps) {
  const [selectedRole, setSelectedRole] = useState<Roles | ''>('')
  const assignRole = useAssignRole()
  const removeRole = useRemoveRole()
  const { enqueueSnackbar } = useSnackbar()
  const existingRoles = user.roles.map((entry) => entry.role)
  const availableRoles = filterRequestableRoles(manageableRoles, existingRoles)

  useEffect(() => {
    if (isEditing) setSelectedRole('')
  }, [isEditing])

  const handleAssign = () => {
    if (!selectedRole) return
    assignRole.mutate(
      { username: user.username, role: selectedRole },
      {
        onSuccess: () => {
          setSelectedRole('')
          enqueueSnackbar('Role assigned', { variant: 'success' })
          onDone()
        },
        onError: () => enqueueSnackbar('Failed to assign role', { variant: 'error' }),
      },
    )
  }

  const handleDone = () => {
    setSelectedRole('')
    onDone()
  }

  return (
    <TableCell>
      <RoleChipsBox>
        {user.roles.length === 0 && (
          <Typography variant="caption" color="text.disabled">No roles</Typography>
        )}
        {user.roles.map((entry) => (
          <UserRoleChip
            key={entry.role}
            role={entry.role}
            disabled={removeRole.isPending}
            onDelete={canManage && isEditing
              ? () => {
                if (removeRole.isPending) return
                removeRole.mutate(
                  { username: user.username, role: entry.role },
                  {
                    onSuccess: () => enqueueSnackbar('Role removed', { variant: 'success' }),
                    onError: () => enqueueSnackbar('Failed to remove role', { variant: 'error' }),
                  },
                )
              }
              : undefined}
          />
        ))}
      </RoleChipsBox>

      <Collapse in={isEditing}>
        <AssignRoleRow>
          {user.roles.some((entry) => entry.role === Roles.ANOMALY_ADMIN) ? (
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
                  onChange={(event) => setSelectedRole(event.target.value as Roles)}
                >
                  {availableRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {formatRole(role)}
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
              <Button
                size="small"
                variant="contained"
                disabled={!selectedRole || assignRole.isPending}
                onClick={handleAssign}
              >
                Add
              </Button>
            </>
          )}
          <Button size="small" color="inherit" onClick={handleDone}>
            Done
          </Button>
        </AssignRoleRow>
      </Collapse>
    </TableCell>
  )
}
