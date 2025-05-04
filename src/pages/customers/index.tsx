import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'
import api from 'src/api/axiosConfig'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${theme.typography.body1}`]: {
    fontSize: 14,
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    lineHeight: '20px',
    letterSpacing: '1px'
  }
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover
  },
  '&:last-of-type td, &:last-of-type th': {
    border: 0
  }
}))

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  ordersCount: number
  totalSpent: number
  lastOrderDate: string
}

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])
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
        const response = await api.get(`https://agriconnect-bc17856a61b8.herokuapp.com/orders/byfarmer/${userId}`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `bearer ${session?.accessToken}`
          }
        })

        // Utiliser directement les données de l'endpoint byfarmer
        const farmerOrders = response.data.data || []
        setOrders(farmerOrders)

        // Créer un map des clients uniques avec leurs statistiques
        const customerMap = new Map<string, Customer>()

        farmerOrders.forEach(order => {
          const buyerName = order.buyer?.[0]
          if (!buyerName) return

          const existingCustomer = customerMap.get(buyerName)
          if (existingCustomer) {
            existingCustomer.ordersCount++
            existingCustomer.totalSpent += order.totalAmount
            if (new Date(order.createdDate) > new Date(existingCustomer.lastOrderDate)) {
              existingCustomer.lastOrderDate = order.createdDate
            }
          } else {
            customerMap.set(buyerName, {
              id: order.orderId,
              firstName: buyerName.split(' ')[0] || '',
              lastName: buyerName.split(' ').slice(1).join(' ') || '',
              email: '',
              phone: '',
              address: '',
              ordersCount: 1,
              totalSpent: order.totalAmount,
              lastOrderDate: order.createdDate
            })
          }
        })

        const customersList = Array.from(customerMap.values())
        setCustomers(customersList)
        setFilteredCustomers(customersList)
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
          customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFilteredCustomers(filtered)
  }, [searchQuery, customers])

  if (isLoading) {
    return <Box sx={{ p: 4 }}>Chargement...</Box>
  }

  if (error) {
    return <Box sx={{ p: 4, color: 'error.main' }}>{error}</Box>
  }

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Mes Clients' />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant='body1'>Total Clients</Typography>
                    <Typography variant='h4'>{customers.length}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant='body1'>Commandes Total</Typography>
                    <Typography variant='h4'>
                      {customers.reduce((sum, customer) => sum + customer.ordersCount, 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant='body1'>Chiffre d'affaires</Typography>
                    <Typography variant='h4'>
                      {customers.reduce((sum, customer) => {
                        const customerOrders = orders.filter(order => 
                          order.buyer?.[0] === `${customer.firstName} ${customer.lastName}` &&
                          ['confirmed', 'delivered', 'completed'].includes(order.status)
                        )
                        return sum + customerOrders.reduce((total, order) => total + order.totalAmount, 0)
                      }, 0).toLocaleString('fr-FR')} FCFA
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant='body1'>Panier moyen</Typography>
                    <Typography variant='h4'>
                      {Math.round(
                        customers.reduce((sum, customer) => sum + customer.totalSpent, 0) / customers.length
                      ).toLocaleString('fr-FR')}{' '}
                      FCFA
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <TextField
                  fullWidth
                  placeholder='Rechercher un client (nom, email)'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  sx={{ mb: 4 }}
                />

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Client</StyledTableCell>
                        <StyledTableCell>Email</StyledTableCell>
                        <StyledTableCell>Téléphone</StyledTableCell>
                        <StyledTableCell>Commandes</StyledTableCell>
                        <StyledTableCell>Total dépensé</StyledTableCell>
                        <StyledTableCell>Dernière commande</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCustomers.map(customer => (
                        <StyledTableRow key={customer.id}>
                          <TableCell>
                            {customer.firstName} {customer.lastName}
                          </TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>{customer.ordersCount}</TableCell>
                          <TableCell>{customer.totalSpent.toLocaleString('fr-FR')} FCFA</TableCell>
                          <TableCell>{customer.lastOrderDate}</TableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CustomersPage 