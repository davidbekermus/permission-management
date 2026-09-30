import { styled } from '@mui/material/styles'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

export const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: 6,
  fontSize: '0.75rem',
  height: 24,
  margin: theme.spacing(0.25),
}))

export const ConfirmBox = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 6,
  padding: theme.spacing(0, 0.75),
  height: 24,
  margin: theme.spacing(0.25),
}))

export const ConfirmButton = styled(Button)(({ theme }) => ({
  minWidth: 0,
  paddingLeft: theme.spacing(0.5),
  paddingRight: theme.spacing(0.5),
  fontSize: '0.7rem',
  lineHeight: 1,
}))
