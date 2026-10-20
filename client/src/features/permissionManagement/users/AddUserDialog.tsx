import { CancelButton } from '../shared/DialogStyles.style'
import { useState } from 'react'
import { useSnackbar } from 'notistack'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { DialogTextField, DialogOptionsPaper, renderDialogRoleOption } from '../shared/DialogFields.style'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import CircularProgress from '@mui/material/CircularProgress'
import { Roles } from '../shared/types'
import { formatRole, getFlowFromRole, normalizeRoles } from '../shared/role.utils'
import { StyledDialogActions, FieldStack } from '../shared/DialogStyles.style'

interface AddUserDialogProps {
  open: boolean
  onClose: () => void
  availableRoles: Roles[]
  isPending: boolean
  onSubmit: (usernames: string[], roles: Roles[]) => Promise<boolean>
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

export const AddUserDialog = ({ open, onClose, availableRoles, isPending, onSubmit }: AddUserDialogProps) => {
  const [form, setForm] = useState<AddUserForm>(INITIAL_FORM)
  const { enqueueSnackbar } = useSnackbar()
  const { usernames, usernameInput, selectedRoles } = form

  const handleRolesChange = (roles: Roles[]) => {
    const normalizedRoles = normalizeRoles(roles)
    const removedRoles = roles.filter((role) => !normalizedRoles.includes(role))

    if (removedRoles.length > 0) {
      const message = normalizedRoles.includes(Roles.ANOMALY_ADMIN)
        ? `${formatRole(Roles.ANOMALY_ADMIN)} (Super Admin) includes all permissions and cannot be combined with other roles. Remove it first to select individual roles.`
        : removedRoles.map((role) => {
          const adminRole = `${getFlowFromRole(role)}_ADMIN` as Roles
          return `${formatRole(adminRole)} already includes ${formatRole(role)} permissions, so only the admin role is kept.`
        }).join(' ')

      enqueueSnackbar(message, { variant: 'info', preventDuplicate: true })
    }

    setForm((current) => ({ ...current, selectedRoles: normalizedRoles }))
  }

  const handleClose = () => {
    setForm(INITIAL_FORM)
    onClose()
  }

  const handleSubmit = async () => {
    if (!isValid || isPending) return
    if (await onSubmit(usernames, selectedRoles)) handleClose()
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
    <Dialog open={open} onClose={isPending ? undefined : handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Add Users</DialogTitle>
      <DialogContent dividers>
        <FieldStack>
          <Autocomplete
            multiple
            freeSolo
            PaperComponent={DialogOptionsPaper}
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
              <DialogTextField
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
            disabled={isPending}
          />
          <Autocomplete
            multiple
            options={availableRoles}
            value={selectedRoles}
            onChange={(_, roles) => handleRolesChange(roles)}
            getOptionLabel={formatRole}
            PaperComponent={DialogOptionsPaper}
            renderOption={renderDialogRoleOption}
            renderInput={(params) => (
              <DialogTextField {...params} label="Roles" size="small" helperText="Applied to every username" />
            )}
            disabled={isPending}
          />
        </FieldStack>
      </DialogContent>
      <StyledDialogActions disableSpacing>
        <CancelButton onClick={handleClose} color="inherit" disabled={isPending}>
          Cancel
        </CancelButton>
        <Button
          color="secondary"
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || isPending}
          startIcon={isPending ? <CircularProgress size="1em" color="inherit" /> : null}
        >
          {isPending
            ? 'Creating...'
            : usernames.length === 0
              ? 'Create users'
              : `Create ${usernames.length} ${usernames.length === 1 ? 'user' : 'users'}`}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
