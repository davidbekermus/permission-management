import type { ChipProps } from '@mui/material/Chip'
import type { RoleSubmissionStatus } from './types'
import type { Roles } from '../shared/types'
import { StyledChip, StyledStatusChip } from './RoleSubmissionChip.style'

function toChipLabel(value: string): string {
  return value.toLowerCase().replace(/_/g, '-')
}

const statusColor: Record<RoleSubmissionStatus, ChipProps['color']> = {
  APPROVED: 'success',
  REJECTED: 'error',
  PENDING: 'default',
  DELETED: 'warning',
}

export function RoleChip({ role }: { role: Roles }) {
  return <StyledChip label={toChipLabel(role)} size="small" />
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
