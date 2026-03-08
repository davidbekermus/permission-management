import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import StoreIcon from '@mui/icons-material/Store'
import InventoryIcon from '@mui/icons-material/Inventory'
import SettingsIcon from '@mui/icons-material/Settings'
import { useNavigate } from '@tanstack/react-router'

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
}))

const CardGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: theme.spacing(3),
  marginTop: theme.spacing(3),
}))

const NavCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  transition: 'box-shadow 0.15s, border-color 0.15s',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    borderColor: theme.palette.primary.main,
  },
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.primary.main + '18',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1.5),
}))

interface NavCardItem {
  label: string
  description: string
  path: string
  icon: React.ReactNode
}

const cards: NavCardItem[] = [
  {
    label: 'Store Management',
    description: 'Browse and manage store items',
    path: '/app/stores',
    icon: <StoreIcon />,
  },
  {
    label: 'Product Management',
    description: 'Browse and manage products',
    path: '/app/products',
    icon: <InventoryIcon />,
  },
  {
    label: 'Settings',
    description: 'Manage users and permission requests',
    path: '/app/settings',
    icon: <SettingsIcon />,
  },
]

export function HomePage() {
  const navigate = useNavigate()

  return (
    <PageWrapper>
      <Typography variant="h5">Home</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Select a section to get started
      </Typography>
      <CardGrid>
        {cards.map((card) => (
          <NavCard key={card.path}>
            <CardActionArea onClick={() => navigate({ to: card.path })} sx={{ p: 2.5 }}>
              <CardContent sx={{ p: 0 }}>
                <IconWrapper>{card.icon}</IconWrapper>
                <Typography variant="subtitle1" fontWeight={600}>
                  {card.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {card.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </NavCard>
        ))}
      </CardGrid>
    </PageWrapper>
  )
}
