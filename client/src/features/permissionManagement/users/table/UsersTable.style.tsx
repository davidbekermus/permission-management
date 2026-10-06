import { styled } from '@mui/material/styles'
import FormControl from '@mui/material/FormControl'

export const AssignRoleRow = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  paddingTop: theme.spacing(1),
}))

export const RoleChipsBox = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}))

export const StyledFormControl = styled(FormControl)({
  flex: 1,
})
