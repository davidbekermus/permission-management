// Displays a role as a chip with an optional inline delete confirmation.
// Used in two modes:
//   - Display only (no onDelete): just a label, no × icon
//   - Interactive (onDelete provided): shows × icon, clicking it triggers a confirm prompt
//     before calling onDelete — prevents accidental role removal

import { useState } from 'react'
import Typography from '@mui/material/Typography'
import type { Role } from '../shared/roles.types'
import { StyledChip, ConfirmBox, ConfirmButton } from './UserRoleChip.style'

// STORE_ADMIN → store-admin
function toChipLabel(role: string): string {
  return role.toLowerCase().replace(/_/g, '-')
}

interface UserRoleChipProps {
  role: Role
  onDelete?: () => void // omit to render as display-only (no × icon)
}

export function UserRoleChip({ role, onDelete }: UserRoleChipProps) {
  const [confirming, setConfirming] = useState(false)

  // Confirmation state: chip is replaced with "Remove X? Yes / No"
  if (confirming && onDelete) {
    return (
      <ConfirmBox>
        <Typography variant="caption" color="text.secondary">
          Remove {toChipLabel(role)}?
        </Typography>
        <ConfirmButton
          size="small"
          color="error"
          onClick={() => { setConfirming(false); onDelete() }}
        >
          Yes
        </ConfirmButton>
        <ConfirmButton
          size="small"
          color="inherit"
          onClick={() => setConfirming(false)}
        >
          No
        </ConfirmButton>
      </ConfirmBox>
    )
  }

  // Default state: chip with optional × icon
  // Clicking × enters confirming state rather than deleting immediately
  return (
    <StyledChip
      label={toChipLabel(role)}
      size="small"
      variant="outlined"
      onDelete={onDelete ? () => setConfirming(true) : undefined}
    />
  )
}
