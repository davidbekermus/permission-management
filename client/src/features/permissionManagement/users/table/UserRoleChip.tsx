// Displays a role as a chip with an optional inline delete confirmation.
// Used in two modes:
//   - Display only (no onDelete): just a label, no × icon
//   - Interactive (onDelete provided): shows × icon, clicking it triggers a confirm prompt
//     before calling onDelete — prevents accidental role removal

import { useState } from 'react'
import Typography from '@mui/material/Typography'
import type { Roles } from '../../shared/types'
import { formatRole } from '../../shared/role.utils'
import { StyledChip, ConfirmLabel, ConfirmButton } from './UserRoleChip.style'

interface UserRoleChipProps {
  role: Roles
  disabled?: boolean
  onDelete?: () => void // omit to render as display-only (no × icon)
}

export function UserRoleChip({ role, onDelete, disabled = false }: UserRoleChipProps) {
  const [confirming, setConfirming] = useState(false)

  // Confirmation state: chip is replaced with "Remove X? Yes / No"
  if (confirming && onDelete) {
    return (
      <StyledChip
        disabled={disabled}
        size="small"
        variant="outlined"
        label={
          <ConfirmLabel>
            <Typography component="span" variant="caption" color="text.secondary">
              Remove {formatRole(role)}?
            </Typography>
            <ConfirmButton
              disabled={disabled}
              size="small"
              color="error"
              onClick={() => { setConfirming(false); onDelete() }}
            >
              Yes
            </ConfirmButton>
            <ConfirmButton
              disabled={disabled}
              size="small"
              color="inherit"
              onClick={() => setConfirming(false)}
            >
              No
            </ConfirmButton>
          </ConfirmLabel>
        }
      />
    )
  }

  // Default state: chip with optional × icon
  // Clicking × enters confirming state rather than deleting immediately
  return (
    <StyledChip
      disabled={disabled}
      label={formatRole(role)}
      size="small"
      variant="outlined"
      onDelete={onDelete ? () => setConfirming(true) : undefined}
    />
  )
}
