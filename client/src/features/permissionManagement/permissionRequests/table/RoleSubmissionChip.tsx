import type { ChipProps } from '@mui/material/Chip'
import { ACTION_LABELS, RoleSubmissionStatus, type RoleSubmissionAction } from '../types'
import type { Roles } from '../../shared/types'
import { formatRole } from '../../shared/role.utils'
import { StyledChip, StyledStatusChip } from './RoleSubmissionChip.style'

const statusColor: Record<RoleSubmissionStatus, ChipProps['color']> = {
  [RoleSubmissionStatus.APPROVED]: 'success',
  [RoleSubmissionStatus.REJECTED]: 'error',
  [RoleSubmissionStatus.PENDING]: 'default',
}

export function RoleChip({ role }: { role: Roles }) {
  return <StyledChip label={formatRole(role)} size="small" />
}

export function RoleSubmissionActionChip({ action }: { action?: RoleSubmissionAction }) {
  if (!action) return null
  return <StyledChip label={ACTION_LABELS[action]} size="small" />
}

export function RoleSubmissionStatusChip({ status }: { status: RoleSubmissionStatus }) {
  return (
    <StyledStatusChip
      label={status.toLowerCase()}
      size="small"
      color={statusColor[status]}
    />
  )
}
