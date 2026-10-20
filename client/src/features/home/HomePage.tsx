import { PageWrapper, CardGrid, NavCard, IconWrapper, Description, NavActionArea, NavContent } from './HomePage.style'
import Typography from '@mui/material/Typography'
import StoreIcon from '@mui/icons-material/Store'
import InventoryIcon from '@mui/icons-material/Inventory'
import SettingsIcon from '@mui/icons-material/Settings'
import { useNavigate } from '@tanstack/react-router'





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

export const HomePage = () => {
  const navigate = useNavigate()

  return (
    <PageWrapper>
      <Typography variant="h5">Home</Typography>
      <Description variant="body2" color="text.secondary">
        Select a section to get started
      </Description>
      <CardGrid>
        {cards.map((card) => (
          <NavCard key={card.path}>
            <NavActionArea onClick={() => navigate({ to: card.path })}>
              <NavContent>
                <IconWrapper>{card.icon}</IconWrapper>
                <Typography variant="subtitle1" fontWeight={600}>
                  {card.label}
                </Typography>
                <Description variant="body2" color="text.secondary">
                  {card.description}
                </Description>
              </NavContent>
            </NavActionArea>
          </NavCard>
        ))}
      </CardGrid>
    </PageWrapper>
  )
}
