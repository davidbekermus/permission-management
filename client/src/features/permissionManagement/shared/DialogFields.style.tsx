import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import type { HTMLAttributes } from 'react'
import type { Roles } from './types'
import { formatRole } from './role.utils'

const fieldPrimary = '#212735'

export const DialogTextField = styled(TextField)({
  '& .MuiInputLabel-root:not(.Mui-error)': {
    color: fieldPrimary,
  },
  '& .MuiOutlinedInput-root': {
    color: '#ffffff',
    caretColor: '#ffffff',
    '&:not(.Mui-error):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': {
      borderColor: fieldPrimary,
      borderWidth: 2,
    },
  },
})

export const DialogOptionsPaper = styled(Paper)({
  backgroundColor: '#313942',
  backgroundImage: 'none',
  color: '#ffffff',
  '& .MuiAutocomplete-option': {
    '&:hover, &.Mui-focused, &.Mui-focusVisible, &[aria-selected="true"], &[aria-selected="true"]:hover, &[aria-selected="true"].Mui-focused, &[aria-selected="true"].Mui-focusVisible': {
      backgroundColor: '#46515e',
    },
  },
})

export function renderDialogRoleOption(
  props: HTMLAttributes<HTMLLIElement>,
  role: Roles,
) {
  return (
    <li {...props}>
      {formatRole(role)}
    </li>
  )
}
