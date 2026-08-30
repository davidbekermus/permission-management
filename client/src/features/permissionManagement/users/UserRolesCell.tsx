import { useEffect, useState } from 'react'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import { useAssignRole, useRemoveRole } from './hooks/useUsers'
import { UserRoleChip } from './UserRoleChip'
import { Roles, type Role } from '../shared/roles.types'
import { filterRequestableRoles } from '../shared/role.utils'
import { AssignRoleRow, RoleChipsBox, StyledFormControl } from './UsersTable.style'
import type { User } from './types'

interface UserRolesCellProps {
  user: User
  manageableRoles: Role[]
  isEditing: boolean
  canManage: boolean
  onDone: () => void
  onMessage: (message: string) => void
}

export function UserRolesCell({
  user,
  manageableRoles,
  isEditing,
  canManage,
  onDone,
  onMessage,
}: UserRolesCellProps) {
  const [selectedRole, setSelectedRole] = useState<Role | ''>('')
  const assignRole = useAssignRole()
  const removeRole = useRemoveRole()
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
          onMessage('Role assigned')
          onDone()
        },
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
            onDelete={canManage && isEditing
              ? () => removeRole.mutate(
                { username: user.username, role: entry.role },
                { onSuccess: () => onMessage('Role removed') },
              )
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
                  onChange={(event) => setSelectedRole(event.target.value as Role)}
                >
                  {availableRoles.map((role) => (
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
