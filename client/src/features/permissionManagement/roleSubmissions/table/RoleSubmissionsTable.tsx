import { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { InfiniteLoadingRow } from '../../shared/InfiniteLoadingRow'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import type { TableLoadingState } from '../../shared/table.types'
import type { SubmissionActions } from './action.types'
import { RoleSubmissionRow } from './RoleSubmissionRow'
import type { RoleSubmission } from '../types'
import { EmptyRow, EmptyTableCell, ScrollableTableContainer } from '../../shared/TableStyles.style'

interface RoleSubmissionsTableProps extends TableLoadingState {
  rows: { submission: RoleSubmission; actions: SubmissionActions }[]
  showReviewActions: boolean
  showControls: boolean
}

export const RoleSubmissionsTable = ({ rows, showReviewActions, showControls, isLoading, isError, pagination }: RoleSubmissionsTableProps) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const colSpan = showControls ? 7 : 6
  if (isError) return <Alert severity="error">Failed to load permission requests.</Alert>

  return (
    <ScrollableTableContainer ref={setContainer}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Requester</TableCell>
            <TableCell>Requested role</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Granted by</TableCell>
            <TableCell>Date</TableCell>
            {showControls && <TableCell align="right">Manage</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && (
            <TableRow>
              <EmptyTableCell colSpan={colSpan}>
                <EmptyRow><CircularProgress /></EmptyRow>
              </EmptyTableCell>
            </TableRow>
          )}
          {!isLoading && rows.length === 0 && (
            <TableRow>
              <EmptyTableCell colSpan={colSpan}>
                <EmptyRow><Typography variant="body2">No permission requests</Typography></EmptyRow>
              </EmptyTableCell>
            </TableRow>
          )}
          {rows.map(({ submission, actions }) => (
            <RoleSubmissionRow
              key={submission._id}
              submission={submission}
              actions={actions}
              showReviewActions={showReviewActions}
              showControls={showControls}
            />
          ))}
          <InfiniteLoadingRow
            container={container}
            colSpan={colSpan}
            hasNextPage={pagination.hasNextPage}
            isFetching={pagination.isFetching}
            isError={pagination.isError}
            enabled={pagination.enabled}
            onLoadMore={pagination.onLoadMore}
          />
        </TableBody>
      </Table>
    </ScrollableTableContainer>
  )
}
