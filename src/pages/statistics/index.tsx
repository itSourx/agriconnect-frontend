import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Paper
} from '@mui/material'
import {
  BarChart as BarChartIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'
import { styled, alpha } from '@mui/material/styles'

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-4px)'
  }
}));

const StatisticsPage = () => {
  const { data: session } = useSession()
  const router = useRouter()

  // Vérifier si l'utilisateur a les permissions (ADMIN ou SUPERADMIN)
  const hasPermission = session?.user?.profileType?.includes('ADMIN') || 
                       session?.user?.profileType?.includes('SUPERADMIN')

  if (!hasPermission) {
    return (
      <Box p={3}>
        <Typography variant="h4" color="error" gutterBottom>
          Accès refusé
        </Typography>
        <Typography variant="body1">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </Typography>
      </Box>
    )
  }

  const statisticsSections = [
    {
      title: 'Statistiques Globales',
      description: 'Vue d\'ensemble des performances globales de la plateforme',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      path: '/statistics/global'
    },
    {
      title: 'Statistiques par Agriculteur',
      description: 'Analyse détaillée des performances par agriculteur',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      path: '/statistics/farmers'
    },
    {
      title: 'Statistiques par Acheteur',
      description: 'Analyse des comportements d\'achat par client',
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      path: '/statistics/buyers'
    }
  ]

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          Centre d'Analyses et Statistiques
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explorez les données et performances de votre plateforme AgriConnect
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {statisticsSections.map((section, index) => (
          <Grid item xs={12} md={4} key={index}>
            <StyledCard onClick={() => router.push(section.path)}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3,
                    bgcolor: alpha(section.color, 0.1),
                    color: section.color
                  }}
                >
                  {section.icon}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  {section.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {section.description}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: section.color,
                    '&:hover': {
                      bgcolor: section.color,
                      opacity: 0.9
                    }
                  }}
                >
                  Accéder aux statistiques
                </Button>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {/* Section d'informations */}
      <Paper sx={{ mt: 6, p: 4, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          À propos des statistiques
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Les statistiques sont mises à jour en temps réel et reflètent l'activité actuelle de la plateforme.
          Vous pouvez filtrer les données par période pour obtenir des analyses plus précises.
        </Typography>
      </Paper>
    </Box>
  )
}

export default StatisticsPage 