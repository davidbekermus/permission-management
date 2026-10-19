export interface SubmissionActions {
  canApprove: boolean
  canReject: boolean
  canDelete: boolean
  isPending: boolean
  isDeleting: boolean
  onApprove: () => void
  onReject: () => void
  onDelete: () => Promise<boolean>
}
