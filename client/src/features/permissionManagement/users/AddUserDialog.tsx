import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import { useCreateUser } from './useUsers'
import { useAuth } from '@/app/providers/AuthProvider'
import { ALL_ROLES, type Role } from '@/features/auth/types'

const FieldStack = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
  paddingTop: theme.spacing(1),
}))

function getFlowFromRole(role: Role): string | null {
  if (role === 'ANOMALY_ADMIN') return null
  return role.split('_')[0]
}

interface AddUserDialogProps {
  open: boolean
  onClose: () => void
}

export function AddUserDialog({ open, onClose }: AddUserDialogProps) {
  const { isAnomalyAdmin, isFlowAdmin } = useAuth()
  const [username, setUsername] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([])
  const createUser = useCreateUser()

  const canManageRole = (role: Role): boolean => {
    if (isAnomalyAdmin) return true
    const flow = getFlowFromRole(role)
    if (!flow) return false
    return isFlowAdmin(flow)
  }

  const availableRoles = ALL_ROLES.filter(canManageRole)

  const handleClose = () => {
    setUsername('')
    setSelectedRoles([])
    createUser.reset()
    onClose()
  }

  const handleSubmit = () => {
    if (username.trim().length < 2 || selectedRoles.length === 0) return
    createUser.mutate(
      { username: username.trim(), roles: selectedRoles },
      { onSuccess: handleClose },
    )
  }

  const isValid = username.trim().length >= 2 && selectedRoles.length > 0

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 600, pb: 0 }}>Add User</DialogTitle>
      <Divider sx={{ mt: 2 }} />
      <DialogContent>
        <FieldStack>
          {createUser.isError && (
            <Alert severity="error">
              Failed to create user. The username may already exist.
            </Alert>
          )}
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            size="small"
            autoFocus
            inputProps={{ minLength: 2 }}
            helperText="Minimum 2 characters"
          />
          <Autocomplete
            multiple
            options={availableRoles}
            value={selectedRoles}
            onChange={(_, val) => setSelectedRoles(val)}
            getOptionLabel={(r) => r.toLowerCase().replace(/_/g, '-')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Roles"
                size="small"
                helperText="At least one role required"
              />
            )}
            disableCloseOnSelect
          />
        </FieldStack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={handleClose} color="inherit" disabled={createUser.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || createUser.isPending}
          startIcon={createUser.isPending ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {createUser.isPending ? 'Creating…' : 'Create user'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
