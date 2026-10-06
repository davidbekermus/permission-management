import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { RoleChip, RoleSubmissionActionChip, RoleSubmissionStatusChip } from './RoleSubmissionChip'
import { RoleSubmissionActionsCell } from './RoleSubmissionActionsCell'
import type { RoleSubmission } from '../types'

interface RoleSubmissionRowProps {
  submission: RoleSubmission
  isAnomalyAdmin: boolean
  currentUsername: string | null
  showControls: boolean
}

export const RoleSubmissionRow = ({ submission, isAnomalyAdmin, currentUsername, showControls }: RoleSubmissionRowProps) => {
  return (
    <TableRow>
      <TableCell><Typography variant="body2" fontWeight={500}>{submission.username}</Typography></TableCell>
      <TableCell><RoleChip role={submission.role} /></TableCell>
      <TableCell><RoleSubmissionActionChip action={submission.action} /></TableCell>
      <TableCell><RoleSubmissionStatusChip status={submission.status} /></TableCell>
      <TableCell><Typography variant="caption" color="text.secondary">{submission.grantedBy ?? '-'}</Typography></TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {new Date(submission.grantedAt ?? submission.createdAt).toLocaleDateString()}
        </Typography>
      </TableCell>
      {showControls && (
        <RoleSubmissionActionsCell submission={submission} isAnomalyAdmin={isAnomalyAdmin} currentUsername={currentUsername} />
      )}
    </TableRow>
  )
}
