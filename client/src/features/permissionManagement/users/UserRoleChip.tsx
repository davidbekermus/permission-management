import Chip from '@mui/material/Chip'
import { styled } from '@mui/material/styles'
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

interface UserRoleChipProps {
  role: Role
  onDelete?: () => void
}

export function UserRoleChip({ role, onDelete }: UserRoleChipProps) {
  return (
    <StyledChip
      label={toChipLabel(role)}
      size="small"
      variant="outlined"
      onDelete={onDelete}
    />
  )
}
