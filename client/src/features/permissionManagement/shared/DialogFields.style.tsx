import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import type { HTMLAttributes } from 'react'
import type { Roles } from './types'
import { formatRole } from './role.utils'

export const DialogTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root:not(.Mui-error)': {
    color: theme.palette.text.primary,
  },
  '& .MuiOutlinedInput-root': {
    color: theme.palette.text.primary,
    caretColor: theme.palette.text.primary,
    '&:not(.Mui-error):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.background.default,
      borderWidth: 2,
    },
  },
}))

export const DialogOptionsPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  backgroundImage: 'none',
  color: theme.palette.text.primary,
  '& .MuiAutocomplete-option': {
    '&:hover, &.Mui-focused, &.Mui-focusVisible, &[aria-selected="true"], &[aria-selected="true"]:hover, &[aria-selected="true"].Mui-focused, &[aria-selected="true"].Mui-focusVisible': {
      backgroundColor: '#46515e',
    },
  },
}))

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
