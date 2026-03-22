import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { useCreateUser } from './hooks/useUsers'
import { ALL_ROLES, type Role } from '@/features/auth/types'
import { useRoleManagement } from '../hooks/useRoleManagement'
import { StyledDialogTitle, StyledDivider, StyledDialogActions, FieldStack } from '../shared/DialogStyles.style'

interface AddUserDialogProps {
  open: boolean
  onClose: () => void
}

export function AddUserDialog({ open, onClose }: AddUserDialogProps) {
  const { canManageRole } = useRoleManagement()
  const [username, setUsername] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([])
  const [snackOpen, setSnackOpen] = useState(false)
  const createUser = useCreateUser()

  const availableRoles = ALL_ROLES.filter(canManageRole)

  const handleClose = () => {
    setUsername('')
    setSelectedRoles([])
    // Reset clears the mutation's error/success state so re-opening starts fresh
    createUser.reset()
    onClose()
  }

  const handleSubmit = () => {
    if (username.trim().length < 2 || selectedRoles.length === 0) return
    createUser.mutate(
      { username: username.trim(), roles: selectedRoles },
      { onSuccess: () => { setSnackOpen(true); handleClose() } },
    )
  }

  const isValid = username.trim().length >= 2 && selectedRoles.length > 0

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <StyledDialogTitle>Add User</StyledDialogTitle>
        <StyledDivider />
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
            />
          </FieldStack>
        </DialogContent>
        <Divider />
        <StyledDialogActions>
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
        </StyledDialogActions>
      </Dialog>

      {/* sx exception: MUI v5 Snackbar has no styled API for content background */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        message="User created"
        ContentProps={{ sx: { backgroundColor: 'success.main' } }}
      />
    </>
  )
}
