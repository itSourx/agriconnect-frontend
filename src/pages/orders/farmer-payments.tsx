import React, { useState, useEffect, useMemo } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import { styled, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  CircularProgress, 
  IconButton, 
  Tooltip, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  InputAdornment
} from '@mui/material'
import { toast } from 'react-hot-toast'
import PaymentIcon from '@mui/icons-material/Payment'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import { useOrders, Order } from '@/hooks/useOrders'
import FarmerPaymentDialog from '@/components/FarmerPaymentDialog'
import api from 'src/api/axiosConfig'

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

const FarmerPaymentsPage = () => {
  const { orders, loading, error, fetchOrders } = useOrders()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('')
  const [adminCompte, setAdminCompte] = useState<number | null>(null)
  const [showCompte, setShowCompte] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarmer, setSelectedFarmer] = useState<string>('all')
  const router = useRouter()
  const { data: session, status } = useSession()

  // Récupérer le compte admin de manière sécurisée
  useEffect(() => {
    const fetchAdminCompte = async () => {
      if (!session?.accessToken) return

      try {
        const response = await api.get('/users/superadmin', {
          headers: {
            'Authorization': `bearer ${session.accessToken}`,
            'Accept': '*/*'
          }
        })
        
        const data = response.data as { compteAdmin: number }
        setAdminCompte(data.compteAdmin)
      } catch (error) {
        console.error('Erreur lors de la récupération du compte admin:', error)
        toast.error('Erreur lors de la récupération du compte admin')
      }
    }

    if (session?.accessToken) {
      fetchAdminCompte()
    }
  }, [session?.accessToken])

  // Guard de navigation - Empêcher l'accès aux profils non-admin
  React.useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    // Vérifier si l'utilisateur a les permissions d'admin
    const isAdmin = session?.user?.profileType === 'ADMIN' || session?.user?.profileType === 'SUPERADMIN'
    
    if (!isAdmin) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handlePaymentClick = (order: Order, farmerId?: string) => {
    setSelectedOrder(order)
    setSelectedFarmerId(farmerId || '')
    setPaymentDialogOpen(true)
  }

  const handlePaymentSuccess = () => {
    fetchOrders() // Refresh orders after successful payment
    toast.success('Paiement effectué avec succès !')
  }

  // Filtrer les commandes éligibles au paiement et les transformer pour gérer les multi-agriculteurs
  const eligibleOrders = useMemo(() => {
    let filtered = orders.filter(order => 
      order.fields.farmerPayment === 'PENDING' && 
      order.fields.payStatus === 'PAID'
    )

    // Transformer les commandes pour gérer les multi-agriculteurs
    const transformedOrders: Array<{
      orderId: string
      orderNumber: string
      createdTime: string
      farmerIds: string[]
      farmerNames: string[]
      farmerOwoAccounts: number[]
      totalAmount: number
      totalProducts: number
      originalOrder: Order
    }> = []

    filtered.forEach(order => {
      const farmerIds = order.fields.farmerId || []
      const farmerFirstNames = order.fields.farmerFirstName || []
      const farmerLastNames = order.fields.farmerLastName || []
      const farmerOwoAccounts = order.fields.farmerOwoAccount || []
      
      // Construire les noms des agriculteurs de manière unique
      const farmerNamesMap = new Map<string, number>()
      for (let i = 0; i < farmerIds.length; i++) {
        const firstName = farmerFirstNames[i] || ''
        const lastName = farmerLastNames[i] || ''
        const fullName = `${firstName} ${lastName}`.trim()
        if (fullName) {
          farmerNamesMap.set(fullName, farmerOwoAccounts[i] || 0)
        }
      }
      
      const uniqueFarmerNames = Array.from(farmerNamesMap.keys())
      const uniqueFarmerOwoAccounts = Array.from(farmerNamesMap.values())

      transformedOrders.push({
        orderId: order.id,
        orderNumber: order.fields.orderNumber || order.id,
        createdTime: order.createdTime,
        farmerIds: farmerIds,
        farmerNames: uniqueFarmerNames,
        farmerOwoAccounts: uniqueFarmerOwoAccounts,
        totalAmount: order.fields.totalPrice || 0, // Garder le montant total de la commande
        totalProducts: order.fields.Nbr || 0,
        originalOrder: order
      })
    })

    // Appliquer les filtres sur les commandes transformées
    let result = transformedOrders

    // Filtre par agriculteur
    if (selectedFarmer !== 'all') {
      result = result.filter(order => {
        return order.farmerNames.some(name => name === selectedFarmer)
      })
    }

    // Filtre par numéro de commande
    if (searchTerm.trim()) {
      result = result.filter(order => {
        return order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    return result
  }, [orders, selectedFarmer, searchTerm])

  // Obtenir la liste unique des agriculteurs pour le filtre
  const uniqueFarmers = useMemo(() => {
    const farmers = new Set<string>()
    orders.forEach(order => {
      if (order.fields.farmerPayment === 'PENDING' && order.fields.payStatus === 'PAID') {
        const farmerFirstNames = order.fields.farmerFirstName || []
        const farmerLastNames = order.fields.farmerLastName || []
        
        // Construire les noms complets des agriculteurs
        for (let i = 0; i < farmerFirstNames.length; i++) {
          const firstName = farmerFirstNames[i] || ''
          const lastName = farmerLastNames[i] || ''
          const fullName = `${firstName} ${lastName}`.trim()
          if (fullName) {
            farmers.add(fullName)
          }
        }
      }
    })
    return Array.from(farmers).sort()
  }, [orders])

  if (status === 'loading' || !session?.user?.profileType || 
      (session?.user?.profileType !== 'ADMIN' && session?.user?.profileType !== 'SUPERADMIN')) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4, mb: 3 }}>
            <Box>
              <Typography variant='h5' mb={1} sx={{ fontWeight: 'bold' }}>
                Paiement des agriculteurs
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Gérez les paiements des agriculteurs pour leurs commandes payées
              </Typography>
            </Box>
            
            {/* Affichage sécurisé du compte admin */}
            {adminCompte && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Compte business:
                </Typography>
                <Typography 
                  variant="body2" 
                  fontFamily="monospace" 
                  sx={{ 
                    backgroundColor: '#f5f5f5', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1,
                    userSelect: 'none'
                  }}
                >
                  {showCompte ? adminCompte : '••••••••'}
                </Typography>
                <Tooltip title={showCompte ? "Masquer le compte" : "Afficher le compte"}>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowCompte(!showCompte)}
                    sx={{ color: 'text.secondary' }}
                  >
                    {showCompte ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Filtres et recherche */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Rechercher par numéro de commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white',
                '&.Mui-focused fieldset': {
                  borderColor: '#388e3c',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#388e3c',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#388e3c',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="farmer-filter-label">Filtrer par agriculteur</InputLabel>
            <Select
              labelId="farmer-filter-label"
              value={selectedFarmer}
              label="Filtrer par agriculteur"
              onChange={(e) => setSelectedFarmer(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon sx={{ color: 'text.secondary', mr: 1 }} />
                </InputAdornment>
              }
              sx={{
                borderRadius: 2,
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#388e3c',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#388e3c',
                  borderWidth: 2,
                },
              }}
            >
              <MenuItem value="all">Tous les agriculteurs</MenuItem>
              {uniqueFarmers.map((farmer) => (
                <MenuItem key={farmer} value={farmer}>
                  {farmer}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {eligibleOrders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PaymentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {searchTerm || selectedFarmer !== 'all' ? 'Aucun résultat trouvé' : 'Aucun paiement en attente'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || selectedFarmer !== 'all' 
              ? 'Essayez de modifier vos critères de recherche.'
              : 'Tous les agriculteurs ont été payés ou aucune commande n\'est éligible au paiement.'
            }
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table aria-label='farmer payments table'>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Numéro de commande</StyledTableCell>
                        <StyledTableCell>Agriculteur</StyledTableCell>
                        <StyledTableCell>Compte OWO</StyledTableCell>
                        <StyledTableCell>Montant (F CFA)</StyledTableCell>
                        <StyledTableCell>Date de commande</StyledTableCell>
                        <StyledTableCell>Actions</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eligibleOrders
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((order) => (
                        <StyledTableRow key={order.orderId}>
                          <TableCell>
                            <Typography variant="body1" fontWeight={500}>
                              {order.orderNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip 
                              title={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Tous les agriculteurs:
                                  </Typography>
                                  {order.farmerNames.map((name, index) => (
                                    <Typography key={index} variant="body2">
                                      {name} - {order.farmerOwoAccounts[index]}
                                    </Typography>
                                  ))}
                                </Box>
                              }
                              arrow
                            >
                              <Typography variant="body1" fontWeight={500}>
                                {order.farmerNames.length > 1 
                                  ? `${order.farmerNames[0]}...` 
                                  : order.farmerNames[0] || 'Agriculteur inconnu'
                                }
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip 
                              title={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Tous les comptes OWO:
                                  </Typography>
                                  {order.farmerOwoAccounts.map((account, index) => (
                                    <Typography key={index} variant="body2">
                                      {order.farmerNames[index]} - {account}
                                    </Typography>
                                  ))}
                                </Box>
                              }
                              arrow
                            >
                              <Typography variant="body2" fontFamily="monospace">
                                {order.farmerOwoAccounts.length > 1 
                                  ? `${order.farmerOwoAccounts[0]}...` 
                                  : order.farmerOwoAccounts[0] || 'N/A'
                                }
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Typography variant="h6" fontWeight={600} color="primary">
                              {order.totalAmount?.toLocaleString('fr-FR')} F CFA
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(order.createdTime).toLocaleDateString('fr-FR')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handlePaymentClick(order.originalOrder, order.farmerIds[0])}
                              startIcon={<PaymentIcon />}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3
                              }}
                            >
                              Payer
                            </Button>
                          </TableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[10, 20, 50]}
                  component='div'
                  count={eligibleOrders.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Dialog de paiement des agriculteurs */}
      <FarmerPaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        order={selectedOrder}
        adminCompte={adminCompte}
        onPaymentSuccess={handlePaymentSuccess}
        selectedFarmerId={selectedFarmerId}
      />
    </Box>
  )
}

export default FarmerPaymentsPage 