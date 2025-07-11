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
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import api from 'src/api/axiosConfig'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from 'src/configs/constants'

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

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
  '& .MuiTableHead-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    '& .MuiTableCell-root': {
      borderBottom: 'none',
      fontWeight: 'bold',
      color: theme.palette.text.primary
    }
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      transition: 'background-color 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.02)
      }
    }
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
  buyerPhone: string
  buyerPhoto?: {
    id: string
    width: number
    height: number
    url: string
    filename: string
    size: number
    type: string
    thumbnails: {
      small: {
        url: string
        width: number
        height: number
      }
      large: {
        url: string
        width: number
        height: number
      }
      full: {
        url: string
        width: number
        height: number
      }
    }
  }
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
  const { id } = router.query
  const { data: session, status } = useSession()

  // Fonction pour générer un ID simple basé sur l'email (même fonction que dans index.tsx)
  const generateCustomerId = (email: string) => {
    const encoded = btoa(email)
    return encoded.replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)
  }

  // Fonction pour décoder l'ID et retrouver l'email
  const decodeCustomerId = (customerId: string) => {
    try {
      // On va chercher dans tous les clients et comparer les IDs générés
      return customerId
    } catch {
      return null
    }
  }

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchCustomerDetails = async () => {
      const userId = session?.user?.id

      if (!userId || !id) {
        router.push('/customers')
        return
      }

      try {
        setIsLoading(true)
        const response = await api.get<Customer[]>(`/orders/getFarmerClients/${userId}`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `bearer ${session?.accessToken}`
          }
        })

        // Décoder l'ID pour retrouver l'email
        const decodedEmail = decodeCustomerId(id as string)
        // Au lieu de chercher par email, on va chercher par ID généré
        const customerData = response.data.find(c => generateCustomerId(c.buyerEmail) === id)
        
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
  }, [router, session, status, id])

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
                {customer.buyerPhoto ? (
                  <Avatar
                    src={customer.buyerPhoto.url}
                    alt={customer.buyerName}
                    sx={{
                      width: 64,
                      height: 64,
                      mr: 2,
                      fontSize: '1.5rem'
                    }}
                  />
                ) : (
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
                )}
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {customer.buyerName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant='body2' color='text.secondary'>
                      {customer.buyerEmail}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant='body2' color='text.secondary'>
                      {customer.buyerPhone}
                    </Typography>
                  </Box>
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
                    p: 3, 
                    bgcolor: alpha('#4caf50', 0.04), 
                    borderRadius: 2,
                    mt: 2
                  }}>
                    <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
                      Statut des commandes
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'white', 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'warning.main',
                          textAlign: 'center',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                          }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: alpha('#ff9800', 0.1),
                            color: '#ff9800',
                            mb: 1,
                            mx: 'auto'
                          }}>
                            <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                              {customer.statusDistribution.pending}
                            </Typography>
                          </Box>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            En attente
                          </Typography>
                          <Typography variant='caption' color='warning.main' sx={{ fontWeight: 'bold' }}>
                            {customer.statusDistribution.pending > 0 ? 
                              `${Math.round((customer.statusDistribution.pending / customer.orderCount) * 100)}%` : 
                              '0%'
                            }
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'white', 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'info.main',
                          textAlign: 'center',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                          }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: alpha('#2196f3', 0.1),
                            color: '#2196f3',
                            mb: 1,
                            mx: 'auto'
                          }}>
                            <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                              {customer.statusDistribution.confirmed}
                            </Typography>
                          </Box>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            Confirmées
                          </Typography>
                          <Typography variant='caption' color='info.main' sx={{ fontWeight: 'bold' }}>
                            {customer.statusDistribution.confirmed > 0 ? 
                              `${Math.round((customer.statusDistribution.confirmed / customer.orderCount) * 100)}%` : 
                              '0%'
                            }
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'white', 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'success.main',
                          textAlign: 'center',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                          }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: alpha('#4caf50', 0.1),
                            color: '#4caf50',
                            mb: 1,
                            mx: 'auto'
                          }}>
                            <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                              {customer.statusDistribution.delivered}
                            </Typography>
                          </Box>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            Livrées
                          </Typography>
                          <Typography variant='caption' color='success.main' sx={{ fontWeight: 'bold' }}>
                            {customer.statusDistribution.delivered > 0 ? 
                              `${Math.round((customer.statusDistribution.delivered / customer.orderCount) * 100)}%` : 
                              '0%'
                            }
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'white', 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'primary.main',
                          textAlign: 'center',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                          }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: alpha('#1976d2', 0.1),
                            color: '#1976d2',
                            mb: 1,
                            mx: 'auto'
                          }}>
                            <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                              {customer.statusDistribution.completed}
                            </Typography>
                          </Box>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            Terminées
                          </Typography>
                          <Typography variant='caption' color='primary.main' sx={{ fontWeight: 'bold' }}>
                            {customer.statusDistribution.completed > 0 ? 
                              `${Math.round((customer.statusDistribution.completed / customer.orderCount) * 100)}%` : 
                              '0%'
                            }
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Barre de progression globale */}
                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography variant='body2' color='text.secondary' gutterBottom>
                        Progression globale des commandes
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        height: 8, 
                        borderRadius: 4, 
                        overflow: 'hidden',
                        bgcolor: 'grey.200'
                      }}>
                        <Box sx={{ 
                          width: `${(customer.statusDistribution.pending / customer.orderCount) * 100}%`,
                          bgcolor: 'warning.main'
                        }} />
                        <Box sx={{ 
                          width: `${(customer.statusDistribution.confirmed / customer.orderCount) * 100}%`,
                          bgcolor: 'info.main'
                        }} />
                        <Box sx={{ 
                          width: `${(customer.statusDistribution.delivered / customer.orderCount) * 100}%`,
                          bgcolor: 'success.main'
                        }} />
                        <Box sx={{ 
                          width: `${(customer.statusDistribution.completed / customer.orderCount) * 100}%`,
                          bgcolor: 'primary.main'
                        }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant='caption' color='text.secondary'>
                          En attente
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Terminées
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Produits achetés - Tableau */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Typography variant='h6' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                Produits achetés
              </Typography>

              <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: alpha('#2196f3', 0.04) }}>Produit</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: alpha('#2196f3', 0.04) }}>Catégorie</TableCell>
                      <TableCell align='right' sx={{ fontWeight: 'bold', backgroundColor: alpha('#2196f3', 0.04) }}>Quantité totale</TableCell>
                      <TableCell align='right' sx={{ fontWeight: 'bold', backgroundColor: alpha('#2196f3', 0.04) }}>Nombre d'achats</TableCell>
                      <TableCell align='right' sx={{ fontWeight: 'bold', backgroundColor: alpha('#2196f3', 0.04) }}>Montant total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(customer.products).map(([productName, product]) => (
                      <TableRow key={product.productId} sx={{ '&:hover': { backgroundColor: alpha('#2196f3', 0.02) } }}>
                        <TableCell>
                          <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                            {productName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.category || 'Non spécifiée'}
                            size='small'
                            sx={{
                              backgroundColor: alpha('#2196f3', 0.1),
                              color: '#2196f3',
                              height: 24,
                              '& .MuiChip-label': {
                                px: 1,
                                fontSize: '0.75rem'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                            {product.totalQuantity} {product.mesure}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Chip
                            label={`${product.purchaseCount} achat${product.purchaseCount > 1 ? 's' : ''}`}
                            size='small'
                            sx={{
                              backgroundColor: alpha('#4caf50', 0.1),
                              color: '#4caf50',
                              height: 24,
                              '& .MuiChip-label': {
                                px: 1,
                                fontSize: '0.75rem'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='subtitle2' sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                            {product.totalSpent.toLocaleString('fr-FR')} FCFA
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CustomerDetailsPage 