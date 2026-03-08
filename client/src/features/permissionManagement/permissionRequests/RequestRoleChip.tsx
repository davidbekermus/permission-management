import Chip from '@mui/material/Chip'
import type { ChipProps } from '@mui/material/Chip'
import { styled } from '@mui/material/styles'
import type { RoleRequestStatus, OverallStatus } from './types'
import type { Role } from '@/features/auth/types'

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: 6,
  fontSize: '0.75rem',
  height: 24,
  margin: theme.spacing(0.25),
}))

function toChipLabel(role: string): string {
  return role.toLowerCase().replace(/_/g, '-')
}

const roleStatusColor: Record<RoleRequestStatus, ChipProps['color']> = {
  APPROVED: 'success',
  REJECTED: 'error',
  PENDING: 'default',
}

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

export function OverallStatusChip({ status }: OverallStatusChipProps) {
  const label = status.toLowerCase().replace(/_/g, ' ')
  return (
    <Chip
      label={label}
      size="small"
      color={overallStatusColor[status]}
      sx={{ borderRadius: '6px', fontWeight: 500, textTransform: 'capitalize' }}
    />
  )
}
