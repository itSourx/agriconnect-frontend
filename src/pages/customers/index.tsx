import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import { styled, alpha } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'
import PeopleIcon from '@mui/icons-material/People'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import api from 'src/api/axiosConfig'

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.1)'
  }
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(2),
  background: theme.palette.background.paper,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)'
}))

const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08)
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12)
    }
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

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchCustomers = async () => {
      const userId = session?.user?.id

      if (!userId) {
        router.push('/auth/login')
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

        const clientsData = response.data || []
        console.log(clientsData)
        setCustomers(clientsData)
        setFilteredCustomers(clientsData)

      } catch (err) {
        setError('Erreur lors de la récupération des clients')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [router, session, status])

  useEffect(() => {
    let filtered = [...customers]
    if (searchQuery) {
      filtered = filtered.filter(
        customer =>
          customer.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.buyerEmail.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFilteredCustomers(filtered)
  }, [searchQuery, customers])

  const totalOrders = customers.reduce((sum, customer) => sum + customer.orderCount, 0)
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0)
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
    <StyledCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant='h6' color='text.secondary'>
            {title}
          </Typography>
        </Box>
        <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </StyledCard>
  )

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

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color='error' variant='h6' sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button variant='contained' onClick={() => router.reload()}>
          Réessayer
        </Button>
      </Box>
    )
  }

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant='h6' sx={{ mb: 2, fontWeight: 'bold' }}>
        Mes Clients
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <StatCard
            title='Total Clients'
            value={customers.length}
            icon={<PeopleIcon sx={{ fontSize: 20 }} />}
            color='#2196f3'
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title='Commandes Total'
            value={totalOrders}
            icon={<ShoppingCartIcon sx={{ fontSize: 20 }} />}
            color='#4caf50'
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Chiffre d'affaires"
            value={`${totalRevenue.toLocaleString('fr-FR')} FCFA`}
            icon={<AttachMoneyIcon sx={{ fontSize: 20 }} />}
            color='#ff9800'
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title='Panier moyen'
            value={`${averageOrderValue.toLocaleString('fr-FR')} FCFA`}
            icon={<TrendingUpIcon sx={{ fontSize: 20 }} />}
            color='#9c27b0'
          />
        </Grid>

        <Grid item xs={12}>
          <SearchTextField
            fullWidth
            placeholder='Rechercher un client...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon color='action' sx={{ fontSize: 20 }} />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            {filteredCustomers.map((customer, index) => (
              <Grid item xs={12} key={index}>
                <StyledPaper sx={{ 
                  p: 3,
                  '&:hover': {
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <Grid container spacing={3}>
                    {/* En-tête du client */}
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha('#2196f3', 0.1),
                            color: '#2196f3',
                            width: 48,
                            height: 48,
                            mr: 2,
                            fontSize: '1.25rem'
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
                    </Grid>

                    {/* Statistiques */}
                    <Grid item xs={12} md={3}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: alpha('#2196f3', 0.04), 
                        borderRadius: 2,
                        height: '100%'
                      }}>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                          Commandes
                        </Typography>
                        <Typography variant='h5' sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                          {customer.orderCount}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                          Total dépensé
                        </Typography>
                        <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                          {customer.totalSpent.toLocaleString('fr-FR')} FCFA
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Statut des commandes */}
                    <Grid item xs={12} md={3}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: alpha('#4caf50', 0.04), 
                        borderRadius: 2,
                        height: '100%'
                      }}>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                          Statut des commandes
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <StatusChip
                            label={`En attente: ${customer.statusDistribution.pending}`}
                            className='pending'
                            size='small'
                            sx={{ height: 24, '& .MuiChip-label': { px: 1.5, fontSize: '0.75rem' } }}
                          />
                          <StatusChip
                            label={`Confirmées: ${customer.statusDistribution.confirmed}`}
                            className='confirmed'
                            size='small'
                            sx={{ height: 24, '& .MuiChip-label': { px: 1.5, fontSize: '0.75rem' } }}
                          />
                          <StatusChip
                            label={`Livrées: ${customer.statusDistribution.delivered}`}
                            className='delivered'
                            size='small'
                            sx={{ height: 24, '& .MuiChip-label': { px: 1.5, fontSize: '0.75rem' } }}
                          />
                          <StatusChip
                            label={`Terminées: ${customer.statusDistribution.completed}`}
                            className='completed'
                            size='small'
                            sx={{ height: 24, '& .MuiChip-label': { px: 1.5, fontSize: '0.75rem' } }}
                          />
                        </Box>
                      </Box>
                    </Grid>

                    {/* Produits achetés */}
                    <Grid item xs={12} md={3}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: alpha('#ff9800', 0.04), 
                        borderRadius: 2,
                        height: '100%'
                      }}>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                          Produits achetés
                        </Typography>
                        <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                          {Object.entries(customer.products).map(([productId, product]) => (
                            <Box 
                              key={productId} 
                              sx={{ 
                                mb: 1, 
                                p: 1.5, 
                                bgcolor: 'background.paper', 
                                borderRadius: 1,
                                '&:last-child': { mb: 0 },
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>

                                  {product.category && (
                                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                      {product.category}
                                    </Typography>
                                  )}
                                </Box>
                                
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant='caption' color='text.secondary'>
                                  {product.purchaseCount} achat{product.purchaseCount > 1 ? 's' : ''}
                                </Typography>
                                <Typography variant='caption' sx={{ fontWeight: 'medium', color: 'success.main' }}>
                                  {product.totalSpent.toLocaleString('fr-FR')} FCFA
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ 
                    mt: 2, 
                    pt: 2, 
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant='caption' color='text.secondary'>
                      Première commande: {customer.firstOrderDate}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Client depuis {new Date(customer.firstOrderDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                    </Typography>
                  </Box>
                </StyledPaper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CustomersPage 