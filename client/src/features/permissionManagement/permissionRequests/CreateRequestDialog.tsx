import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import { useCreatePermissionRequest } from './usePermissionRequests'
import { useAuth } from '@/app/providers/AuthProvider'
import { ALL_ROLES, type Role } from '@/features/auth/types'

const FieldStack = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
  paddingTop: theme.spacing(1),
}))

interface CreateRequestDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateRequestDialog({ open, onClose }: CreateRequestDialogProps) {
  const { roles: myRoles } = useAuth()
  const [selected, setSelected] = useState<Role[]>([])
  const createRequest = useCreatePermissionRequest()

  const availableRoles = ALL_ROLES.filter((r) => !myRoles.includes(r))

  const handleClose = () => {
    setSelected([])
    createRequest.reset()
    onClose()
  }

  const handleSubmit = () => {
    if (selected.length === 0) return
    createRequest.mutate(selected, { onSuccess: handleClose })
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 600, pb: 0 }}>Request Permission</DialogTitle>
      <Divider sx={{ mt: 2 }} />
      <DialogContent>
        <FieldStack>
          {createRequest.isError && (
            <Alert severity="error">Failed to submit request. Please try again.</Alert>
          )}
          <Autocomplete
            multiple
            options={availableRoles}
            value={selected}
            onChange={(_, val) => setSelected(val)}
            getOptionLabel={(r) => r.toLowerCase().replace(/_/g, '-')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Roles to request"
                size="small"
                helperText="At least one role required"
              />
            )}
            disableCloseOnSelect
            disabled={createRequest.isPending}
          />
        </FieldStack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={handleClose} color="inherit" disabled={createRequest.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={selected.length === 0 || createRequest.isPending}
          startIcon={createRequest.isPending ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {createRequest.isPending ? 'Submitting…' : 'Submit request'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
