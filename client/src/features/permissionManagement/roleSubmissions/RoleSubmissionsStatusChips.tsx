import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { STATUS_LABELS, type RoleSubmissionStatus } from './types'

interface RoleSubmissionsStatusChipsProps {
  statuses: RoleSubmissionStatus[]
  onStatusDelete: (status: RoleSubmissionStatus) => void
}

export function RoleSubmissionsStatusChips({ statuses, onStatusDelete }: RoleSubmissionsStatusChipsProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      <Typography variant="body2" color="text.secondary">
        Showing:
      </Typography>
      {statuses.map((status) => (
        <Chip
          key={status}
          label={STATUS_LABELS[status]}
          size="small"
          variant="outlined"
          onDelete={() => onStatusDelete(status)}
        />
      ))}
    </Stack>
  )
}
