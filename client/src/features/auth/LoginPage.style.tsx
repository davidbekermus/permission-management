import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

export const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
}))

export const LoginCard = styled(Card)(() => ({
  width: '100%',
  maxWidth: 400,
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
}))

export const Form = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

export const LoginContent = styled(CardContent)(({ theme }) => ({ padding: theme.spacing(4) }))
export const LoginDescription = styled(Typography)(({ theme }) => ({ marginBottom: theme.spacing(3) }))
