import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { styled, alpha } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import api from 'src/api/axiosConfig'

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.1)'
  }
}))

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: 8,
  padding: '4px 8px',
  '&.pending': {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main
  },
  '&.confirmed': {
    backgroundColor: alpha(theme.palette.info.main, 0.1),
    color: theme.palette.info.main
  },
  '&.delivered': {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main
  },
  '&.completed': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main
  }
}))

interface Product {
  productId: string
  lib: string
  category?: string
  mesure: string
  totalQuantity: number
  totalSpent: number
  purchaseCount: number
}

interface StatusDistribution {
  pending: number
  confirmed: number
  delivered: number
  completed: number
}

interface Customer {
  buyerName: string
  buyerEmail: string
  orderCount: number
  firstOrderDate: string
  products: Record<string, Product>
  statusDistribution: StatusDistribution
  totalSpent: number
}

const CustomerDetailsPage = () => {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { email } = router.query
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchCustomerDetails = async () => {
      const userId = session?.user?.id

      if (!userId || !email) {
        router.push('/customers')
        return
      }

      try {
        setIsLoading(true)
        const response = await api.get<Customer[]>(`https://agriconnect-bc17856a61b8.herokuapp.com/orders/getFarmerClients/${userId}`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `bearer ${session?.accessToken}`
          }
        })

        const customerData = response.data.find(c => c.buyerEmail === email)
        if (customerData) {
          setCustomer(customerData)
        } else {
          setError('Client non trouvé')
        }

      } catch (err) {
        setError('Erreur lors de la récupération des détails du client')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomerDetails()
  }, [router, session, status, email])

  if (isLoading) {
    return (
      <Box sx={{ 
        p: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant='h6' sx={{ mt: 3, color: 'text.secondary' }}>
          Chargement des données...
        </Typography>
      </Box>
    )
  }

  if (error || !customer) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color='error' variant='h6' sx={{ mb: 2 }}>
          {error || 'Client non trouvé'}
        </Typography>
        <Button variant='contained' onClick={() => router.push('/customers')}>
          Retour à la liste
        </Button>
      </Box>
    )
  }

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => router.push('/customers')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
          Détails du client
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Informations du client */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha('#2196f3', 0.1),
                    color: '#2196f3',
                    width: 64,
                    height: 64,
                    mr: 2,
                    fontSize: '1.5rem'
                  }}
                >
                  {customer.buyerName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {customer.buyerName}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {customer.buyerEmail}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ 
                p: 2, 
                bgcolor: alpha('#2196f3', 0.04), 
                borderRadius: 2,
                mb: 2
              }}>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Client depuis
                </Typography>
                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                  {customer.firstOrderDate}
                </Typography>
              </Box>

              <Box sx={{ 
                p: 2, 
                bgcolor: alpha('#4caf50', 0.04), 
                borderRadius: 2
              }}>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Total dépensé
                </Typography>
                <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                  {customer.totalSpent.toLocaleString('fr-FR')} FCFA
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Statistiques des commandes */}
        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent>
              <Typography variant='h6' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                Statistiques des commandes
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: alpha('#2196f3', 0.04), 
                    borderRadius: 2,
                    height: '100%'
                  }}>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      Nombre total de commandes
                    </Typography>
                    <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                      {customer.orderCount}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: alpha('#ff9800', 0.04), 
                    borderRadius: 2,
                    height: '100%'
                  }}>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      Valeur moyenne des commandes
                    </Typography>
                    <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                      {Math.round(customer.totalSpent / customer.orderCount).toLocaleString('fr-FR')} FCFA
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: alpha('#4caf50', 0.04), 
                    borderRadius: 2,
                    mt: 2
                  }}>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      Statut des commandes
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <StatusChip
                          label={`En attente: ${customer.statusDistribution.pending}`}
                          className='pending'
                          size='small'
                          sx={{ height: 24, '& .MuiChip-label': { px: 1.5, fontSize: '0.75rem' } }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <StatusChip
                          label={`Confirmées: ${customer.statusDistribution.confirmed}`}
                          className='confirmed'
                          size='small'
                          sx={{ height: 24, '& .MuiChip-label': { px: 1.5, fontSize: '0.75rem' } }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <StatusChip
                          label={`Livrées: ${customer.statusDistribution.delivered}`}
                          className='delivered'
                          size='small'
                          sx={{ height: 24, '& .MuiChip-label': { px: 1.5, fontSize: '0.75rem' } }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <StatusChip
                          label={`Terminées: ${customer.statusDistribution.completed}`}
                          className='completed'
                          size='small'
                          sx={{ height: 24, '& .MuiChip-label': { px: 1.5, fontSize: '0.75rem' } }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Produits achetés */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Typography variant='h6' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                Produits achetés
              </Typography>

              <Grid container spacing={2}>
                {Object.entries(customer.products).map(([productName, product]) => (
                  <Grid item xs={12} sm={6} md={4} key={product.productId}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: alpha('#2196f3', 0.04), 
                      borderRadius: 2,
                      height: '100%'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                            {productName}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {product.category}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${product.purchaseCount} achat${product.purchaseCount > 1 ? 's' : ''}`}
                          size='small'
                          sx={{ 
                            bgcolor: alpha('#4caf50', 0.1),
                            color: '#4caf50'
                          }}
                        />
                      </Box>

                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <Typography variant='body2' color='text.secondary'>
                          {product.totalQuantity} unités
                        </Typography>
                        <Typography variant='subtitle1' sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {product.totalSpent.toLocaleString('fr-FR')} FCFA
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CustomerDetailsPage 