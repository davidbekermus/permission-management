// Two chip components are exported from this file:
//   RoleStatusChip     — shows a single role name + its per-role review status (PENDING/APPROVED/REJECTED)
//   OverallStatusChip  — shows the request-level rollup status (adds PARTIALLY_APPROVED)

import type { ChipProps } from '@mui/material/Chip'
import type { RoleRequestStatus, OverallStatus } from './types'
import type { Role } from '@/features/auth/types'
import { StyledChip, StyledOverallStatusChip } from './RequestRoleChip.style'

function toChipLabel(role: string): string {
  return role.toLowerCase().replace(/_/g, '-')
}

// Maps each per-role status to an MUI chip color token
const roleStatusColor: Record<RoleRequestStatus, ChipProps['color']> = {
  APPROVED: 'success',
  REJECTED: 'error',
  PENDING: 'default',
}

// Maps overall request status — same as above plus 'warning' for mixed results
const overallStatusColor: Record<OverallStatus, ChipProps['color']> = {
  APPROVED: 'success',
  REJECTED: 'error',
  PENDING: 'default',
  PARTIALLY_APPROVED: 'warning',
}

interface RoleStatusChipProps {
  role: Role
  status: RoleRequestStatus
}

// Used in the Requested Roles column — one chip per role, color reflects review outcome
export function RoleStatusChip({ role, status }: RoleStatusChipProps) {
  return (
    <StyledChip
      label={toChipLabel(role)}
      size="small"
      color={roleStatusColor[status]}
    />
  )
}

interface OverallStatusChipProps {
  status: OverallStatus
}

// Used in the Status column — single chip summarising the whole request
export function OverallStatusChip({ status }: OverallStatusChipProps) {
  const label = status.toLowerCase().replace(/_/g, ' ')
  return (
    <StyledOverallStatusChip
      label={label}
      size="small"
      color={overallStatusColor[status]}
    />
  )
}
