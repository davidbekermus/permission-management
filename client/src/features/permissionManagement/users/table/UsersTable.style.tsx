import { styled } from '@mui/material/styles'
import FormControl from '@mui/material/FormControl'

export const AssignRoleRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  alignItems: 'center',
  paddingTop: theme.spacing(1),
}))

export const RoleChipsBox = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}))

export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: 240,
  maxWidth: '100%',
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.text.primary,
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.background.default,
  },
}))
