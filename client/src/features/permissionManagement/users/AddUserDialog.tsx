import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import CircularProgress from '@mui/material/CircularProgress'
import { useSnackbar } from 'notistack'
import { useCreateUsers } from './hooks/useUsers'
import type { Roles } from '../shared/types'
import { getRolesInAdminScope } from '@/app/auth/auth.utils'
import { formatRole, normalizeRoles } from '../shared/role.utils'
import { StyledDialogActions, FieldStack } from '../shared/DialogStyles.style'

interface AddUserDialogProps {
  open: boolean
  onClose: () => void
}

interface AddUserForm {
  usernames: string[]
  usernameInput: string
  selectedRoles: Roles[]
}

const INITIAL_FORM: AddUserForm = {
  usernames: [],
  usernameInput: '',
  selectedRoles: [],
}

export function AddUserDialog({ open, onClose }: AddUserDialogProps) {
  const { enqueueSnackbar } = useSnackbar()
  const [form, setForm] = useState<AddUserForm>(INITIAL_FORM)
  const { usernames, usernameInput, selectedRoles } = form
  const createUsers = useCreateUsers()
  const availableRoles = getRolesInAdminScope()

  const handleClose = () => {
    setForm(INITIAL_FORM)
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
    setForm((current) => ({
      ...current,
      usernames: normalizeUsernames([...current.usernames, current.usernameInput]),
      usernameInput: '',
    }))
  }

  const hasShortUsername = usernames.some((username) => username.length < 2)
  const isValid =
    usernames.length > 0 &&
    !hasShortUsername &&
    selectedRoles.length > 0

  return (
    <Dialog open={open} onClose={createUsers.isPending ? undefined : handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Add Users</DialogTitle>
      <DialogContent dividers>
        <FieldStack>
          <Autocomplete
            multiple
            freeSolo
            options={[] as string[]}
            value={usernames}
            inputValue={usernameInput}
            onInputChange={(_, value, reason) => {
              if (reason === 'reset') return
              setForm((current) => ({
                ...current,
                usernameInput: value,
              }))
            }}
            onChange={(_, values, reason) => {
              setForm((current) => ({
                ...current,
                usernames: normalizeUsernames(values),
                usernameInput: reason === 'createOption' ? '' : current.usernameInput,
              }))
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Usernames"
                size="small"
                autoFocus
                onBlur={commitUsernameInput}
                error={hasShortUsername}
                helperText={hasShortUsername
                  ? 'Each username must be at least 2 characters. Remove or replace shorter usernames.'
                  : 'Type a username and press Enter, or paste comma-separated usernames.'}
              />
            )}
            disabled={createUsers.isPending}
          />
          <Autocomplete
            multiple
            options={availableRoles}
            value={selectedRoles}
            onChange={(_, roles) => setForm((current) => ({
              ...current,
              selectedRoles: normalizeRoles(roles),
            }))}
            getOptionLabel={formatRole}
            renderInput={(params) => (
              <TextField {...params} label="Roles" size="small" helperText="Applied to every username" />
            )}
            disabled={createUsers.isPending}
          />
        </FieldStack>
      </DialogContent>
      <StyledDialogActions disableSpacing>
        <Button onClick={handleClose} color="inherit" disabled={createUsers.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || createUsers.isPending}
          startIcon={createUsers.isPending ? <CircularProgress size="1em" color="inherit" /> : null}
        >
          {createUsers.isPending
            ? 'Creating...'
            : usernames.length === 0
              ? 'Create users'
              : `Create ${usernames.length} ${usernames.length === 1 ? 'user' : 'users'}`}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
