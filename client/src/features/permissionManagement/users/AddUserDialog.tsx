import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { useSnackbar } from 'notistack'
import { useCreateUsers } from './hooks/useUsers'
import { ALL_ROLES, type Role } from '@/features/auth/types'
import { useRoleManagement } from '../hooks/useRoleManagement'
import { StyledDialogTitle, StyledDivider, StyledDialogActions, FieldStack } from '../shared/DialogStyles.style'

interface AddUserDialogProps {
  open: boolean
  onClose: () => void
}

export function AddUserDialog({ open, onClose }: AddUserDialogProps) {
  const { canManageRole } = useRoleManagement()
  const { enqueueSnackbar } = useSnackbar()
  const [usernames, setUsernames] = useState<string[]>([])
  const [usernameInput, setUsernameInput] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([])
  const createUsers = useCreateUsers()
  const availableRoles = ALL_ROLES.filter(canManageRole)

  const handleClose = () => {
    setUsernames([])
    setUsernameInput('')
    setSelectedRoles([])
    createUsers.reset()
    onClose()
  }

  const handleSubmit = () => {
    if (usernames.length === 0 || selectedRoles.length === 0) return
    createUsers.mutate(
      { usernames, roles: selectedRoles },
      {
        onSuccess: (createdUsers) => {
          const skippedCount = usernames.length - createdUsers.length
          const message = skippedCount > 0
            ? `${createdUsers.length} created, ${skippedCount} existing ${skippedCount === 1 ? 'user was' : 'users were'} skipped`
            : `${createdUsers.length} ${createdUsers.length === 1 ? 'user' : 'users'} created successfully`
          enqueueSnackbar(message, { variant: createdUsers.length > 0 ? 'success' : 'info' })
          handleClose()
        },
        onError: () => {
          enqueueSnackbar('Failed to create users.', {
            variant: 'error',
          })
        },
      },
    )
  }

  const normalizeUsernames = (values: string[]) =>
    values
      .flatMap((value) => value.split(','))
      .map((value) => value.trim())
      .filter((value, index, all) => value.length > 0 && all.indexOf(value) === index)

  const commitUsernameInput = () => {
    if (!usernameInput.trim()) return
    setUsernames((current) => normalizeUsernames([...current, usernameInput]))
    setUsernameInput('')
  }

  const isValid =
    usernames.length > 0 &&
    usernames.every((username) => username.length >= 2) &&
    selectedRoles.length > 0

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <StyledDialogTitle>Add Users</StyledDialogTitle>
      <StyledDivider />
      <DialogContent>
        <FieldStack>
          <Autocomplete
            multiple
            freeSolo
            options={[] as string[]}
            value={usernames}
            inputValue={usernameInput}
            onInputChange={(_, value) => setUsernameInput(value)}
            onChange={(_, values) => {
              setUsernames(normalizeUsernames(values))
              setUsernameInput('')
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Usernames"
                size="small"
                autoFocus
                onBlur={commitUsernameInput}
                helperText="Type a username and press Enter, or paste comma-separated usernames."
              />
            )}
            disabled={createUsers.isPending}
          />
          <Autocomplete
            multiple
            options={availableRoles}
            value={selectedRoles}
            onChange={(_, roles) => setSelectedRoles(roles)}
            getOptionLabel={(role) => role.toLowerCase().replace(/_/g, '-')}
            renderInput={(params) => (
              <TextField {...params} label="Roles" size="small" helperText="Applied to every username" />
            )}
            disabled={createUsers.isPending}
          />
        </FieldStack>
      </DialogContent>
      <Divider />
      <StyledDialogActions>
        <Button onClick={handleClose} color="inherit" disabled={createUsers.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || createUsers.isPending}
          startIcon={createUsers.isPending ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {createUsers.isPending ? 'Creating...' : `Create ${usernames.length || ''} ${usernames.length === 1 ? 'user' : 'users'}`}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
