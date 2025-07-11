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
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Tooltip from '@mui/material/Tooltip'
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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': { 
    fontWeight: 'bold',
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderBottom: 'none'
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02)
  },
  '&:last-child td, &:last-child th': { border: 0 },
}));

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

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const router = useRouter()
  const { data: session, status } = useSession()

  // Fonction pour générer un ID simple basé sur l'email
  const generateCustomerId = (email: string) => {
    // Créer un hash simple mais réversible
    const encoded = btoa(email)
    // Remplacer les caractères spéciaux et garder seulement alphanumériques
    return encoded.replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)
  }

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
        const response = await api.get<Customer[]>(`/orders/getFarmerClients/${userId}`, {
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const totalOrders = customers.reduce((sum, customer) => sum + customer.orderCount, 0)
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0)
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: `${color}15`,
          color: color,
          mb: 2
        }}
      >
        {icon}
      </Box>
      <Typography variant='h4' sx={{ mb: 1, fontWeight: 'bold', color: 'text.primary' }}>
        {value}
      </Typography>
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
    </Paper>
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

      <Grid container spacing={2} sx={{ mb: 4 }}>
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
              </Grid>

      <StyledCard>
        <CardContent>
          <Box sx={{ mb: 3 }}>
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
                />
          </Box>

          <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                  <StyledTableCell>Client</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Téléphone</StyledTableCell>
                  <StyledTableCell>Commandes</StyledTableCell>
                  <StyledTableCell>Total dépensé</StyledTableCell>
                  <StyledTableCell>Client depuis</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                {filteredCustomers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((customer, index) => (
                    <StyledTableRow 
                      key={index}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {customer.buyerPhoto ? (
                            <Avatar
                              src={customer.buyerPhoto.url}
                              alt={customer.buyerName}
                              sx={{
                                width: 32,
                                height: 32,
                                mr: 2,
                                fontSize: '0.875rem'
                              }}
                            />
                          ) : (
                            <Avatar
                              sx={{
                                bgcolor: alpha('#2196f3', 0.1),
                                color: '#2196f3',
                                width: 32,
                                height: 32,
                                mr: 2,
                                fontSize: '0.875rem'
                              }}
                            >
                              {customer.buyerName.charAt(0)}
                            </Avatar>
                          )}
                          <Typography variant='body2' sx={{ fontWeight: 500 }}>
                            {customer.buyerName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color="text.secondary">
                          {customer.buyerEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color="text.secondary">
                          {customer.buyerPhone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={customer.orderCount}
                          size='small'
                          sx={{ 
                            bgcolor: alpha('#4caf50', 0.1),
                            color: '#4caf50',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          {customer.totalSpent.toLocaleString('fr-FR')} FCFA
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color="text.secondary">
                          {customer.firstOrderDate}
                        </Typography>
                      </TableCell>
                          <TableCell align="center">
                        <Tooltip title="Voir les détails" arrow>
                          <IconButton 
                            size='small'
                            onClick={() => router.push(`/customers/${generateCustomerId(customer.buyerEmail)}`)}
                            sx={{ 
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: 'white'
                              }
                            }}
                          >
                            <VisibilityIcon style={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                          </TableCell>
                    </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

          <TablePagination
            component='div'
            count={filteredCustomers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            sx={{ mt: 2 }}
          />
            </CardContent>
          </StyledCard>
    </Box>
  )
}

export default CustomersPage 