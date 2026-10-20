import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

export const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
}))

export const CardGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: theme.spacing(3),
  marginTop: theme.spacing(3),
}))

export const NavCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  transition: 'box-shadow 0.15s, border-color 0.15s',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    borderColor: theme.palette.secondary.main,
  },
}))

export const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.secondary.main + '18',
  color: theme.palette.secondary.main,
  marginBottom: theme.spacing(1.5),
}))

export const Description = styled(Typography)(({ theme }) => ({ marginTop: theme.spacing(0.5) }))
export const NavActionArea = styled(CardActionArea)(({ theme }) => ({ padding: theme.spacing(2.5) }))
export const NavContent = styled(CardContent)({ padding: 0 })
