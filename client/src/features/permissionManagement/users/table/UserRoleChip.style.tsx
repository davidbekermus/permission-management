import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'

export { StyledChip } from '../../shared/ChipStyles.style'

export const ConfirmLabel = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}))

export const ConfirmButton = styled(Button)(({ theme }) => ({
  minWidth: 0,
  paddingLeft: theme.spacing(0.5),
  paddingRight: theme.spacing(0.5),
  fontSize: theme.typography.caption.fontSize,
  lineHeight: 1,
}))
