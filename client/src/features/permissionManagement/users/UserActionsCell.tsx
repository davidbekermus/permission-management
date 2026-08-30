import TableCell from '@mui/material/TableCell'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import type { Roles } from '../shared/types'
import { filterRequestableRoles } from '../shared/role.utils'
import type { User } from './types'

interface UserActionsCellProps {
  user: User
  manageableRoles: Roles[]
  isEditing: boolean
  onManage: (username: string) => void
}

export function UserActionsCell({
  user,
  manageableRoles,
  isEditing,
  onManage,
}: UserActionsCellProps) {
  const existingRoles = user.roles.map((entry) => entry.role)
  const canAdd = filterRequestableRoles(manageableRoles, existingRoles).length > 0
  const canRemove = existingRoles.length > 0
  const canAct = canAdd || canRemove

  return (
    <TableCell align="right">
      {!isEditing && (
        <Tooltip title={canAct ? 'Manage roles' : 'Nothing to manage'}>
          <span>
            <IconButton
              size="small"
              disabled={!canAct}
              aria-label={`Manage roles for ${user.username}`}
              aria-expanded={false}
              onClick={() => onManage(user.username)}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </TableCell>
  )
}
