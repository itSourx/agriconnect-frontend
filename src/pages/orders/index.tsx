// pages/orders/index.tsx
import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import OutlinedInput from '@mui/material/OutlinedInput'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import DeleteBinLineIcon from 'remixicon-react/DeleteBinLineIcon'
import { 
  ShoppingCart, 
  Inventory, 
  MonetizationOn, 
  TrendingUp,
  CalendarToday 
} from '@mui/icons-material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { styled, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useRouter } from 'next/navigation'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Avatar from '@mui/material/Avatar'
import { useNotifications } from '@/hooks/useNotifications'
import dynamic from 'next/dynamic'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': { fontWeight: 'bold' }
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
  '&:last-of-type td, &:last-of-type th': { border: 0 }
}))

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.1)'
  }
}))

interface Order {
  id: string
  createdTime: string
  fields: {
    status: string
    totalPrice: number
    Qty: string
    productName: string[]
    farmerFirstName: string[]
    farmerLastName: string[]
    buyerFirstName: string[]
    buyerLastName: string[]
    mesure: string[]
    price: number[]
    orderNumber: string
    Nbr?: number
    farmerId?: string[]
    Status?: string
  }
}

type StatusColor = 'warning' | 'success' | 'info' | 'error' | 'primary' | 'secondary' | 'default'

interface StatusTranslation {
  label: string
  color: StatusColor
}

const statusTranslations: Record<string, StatusTranslation> = {
  pending: { label: 'En attente', color: 'warning' },
  confirmed: { label: 'Confirmée', color: 'success' },
  delivered: { label: 'Livrée', color: 'info' },
  completed: { label: 'Terminée', color: 'success' }
}

interface OrderStats {
  period: {
    start: string
    end: string
  }
  totalOrders: number
  totalProducts: number
  globalTotalRevenue: number
  products: Array<{
    productId: string
    orderCount: number
    productName: string
    category: string
    mesure: string
    totalQuantity: number
    totalRevenue: number
    percentageOfTotal: number
    percentageOfOrders: number
  }>
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [farmerFilter, setFarmerFilter] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const router = useRouter()
  const { notifyOrderDeleted, notifyError } = useNotifications()

  // Charger et trier les commandes
  useEffect(() => {
    fetch('https://agriconnect-bc17856a61b8.herokuapp.com/orders', {
      headers: { accept: '*/*' }
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        // Trier par date (du plus récent au plus ancien)
        const sortedOrders = data.sort((a: Order, b: Order) =>
          new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
        )
        setOrders(sortedOrders)
        setFilteredOrders(sortedOrders)
      })
      .catch(error => console.error('Erreur lors de la récupération des commandes:', error))
  }, [])

  // Charger les statistiques
  useEffect(() => {
    const fetchStats = async () => {
      try {
        let url = 'https://agriconnect-bc17856a61b8.herokuapp.com/orders/stats'
        if (startDate && endDate) {
          const params = new URLSearchParams({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          })
          url += `?${params.toString()}`
        }

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des statistiques')
        }
        const data = await response.json()
        setOrderStats(data)
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      }
    }

    fetchStats()
  }, [startDate, endDate])

  // Filtrer les commandes
  useEffect(() => {
    let filtered = [...orders]

    if (farmerFilter) {
      filtered = filtered.filter(order => order.fields.farmerId?.[0] === farmerFilter)
    }
    if (productFilter) {
      filtered = filtered.filter(order => order.fields.productName?.[0] === productFilter)
    }
    if (statusFilter) {
      filtered = filtered.filter(order => order.fields.status === statusFilter)
    }
    if (searchQuery) {
      filtered = filtered.filter(
        order =>
          order.fields.farmerFirstName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.farmerLastName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.buyerFirstName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.buyerLastName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.productName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredOrders(filtered)
    setPage(0)
  }, [farmerFilter, productFilter, statusFilter, searchQuery, orders])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDelete = (id: string) => {
    const orderToDelete = orders.find(order => order.id === id)
    if (!orderToDelete) {
      notifyError('Commande non trouvée')
      return
    }

    fetch(`https://agriconnect-bc17856a61b8.herokuapp.com/orders/${id}`, {
      method: 'DELETE',
      headers: { accept: '*/*' }
    })
      .then(response => {
        if (response.ok) {
          setOrders(orders.filter(order => order.id !== id))
          setFilteredOrders(filteredOrders.filter(order => order.id !== id))
          notifyOrderDeleted(orderToDelete.fields.orderNumber || id)
        } else {
          notifyError('Erreur lors de la suppression de la commande')
        }
      })
      .catch(error => {
        console.error('Erreur lors de la suppression de la commande:', error)
        notifyError('Erreur lors de la suppression de la commande')
      })
  }

  const handleViewDetails = (id: string) => {
    router.push(`/orders/orderdetail/${id}`)
  }

  // Options uniques pour les filtres
  const farmers = Array.from(
    new Map(
      orders.map(o => [
        o.fields.farmerId?.[0],
        {
          id: o.fields.farmerId?.[0],
          firstName: o.fields.farmerFirstName?.[0],
          lastName: o.fields.farmerLastName?.[0]
        }
      ])
    ).values()
  ).filter(f => f.id)

  const products = [...new Set(orders.map(o => o.fields.productName?.[0]).filter(Boolean))]
  const statuses = ['pending', 'confirmed', 'delivered', 'completed']

  const handleDeleteClick = (id: string) => {
    setOrderToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (orderToDelete) {
      handleDelete(orderToDelete)
      setDeleteDialogOpen(false)
      setOrderToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setOrderToDelete(null)
  }

  const countOrdersByStatus = () => {
    const counts = {
      pending: 0,
      confirmed: 0,
      delivered: 0,
      completed: 0,
    }

    orders.forEach(order => {
      const status = order.fields.status
      if (status) {
        counts[status as keyof typeof counts]++
      }
    })

    return counts
  }
  const statusCounts = countOrdersByStatus()

  // Préparer les données pour les graphiques
  const topProductsData = orderStats?.products.slice(0, 5).map(product => ({
    name: product.productName,
    revenue: product.totalRevenue,
    percentage: product.percentageOfTotal
  })) || []

  const categoryData = orderStats?.products.reduce((acc, product) => {
    const category = product.category
    const existing = acc.find(item => item.name === category)
    if (existing) {
      existing.value += product.totalRevenue
    } else {
      acc.push({ name: category, value: product.totalRevenue })
    }
    return acc
  }, [] as { name: string; value: number }[]) || []

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4, pb: 4 }}
          >
            <Box>
              <Typography variant='h5' mb={1} sx={{ fontWeight: 'bold' }}>
                Liste des commandes
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Sélecteur de dates */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center' mb={2}>
                <CalendarToday color='primary' sx={{ mr: 1 }} />
                <Typography variant='h6'>Période d'analyse</Typography>
              </Box>
              <Box display='flex' gap={2}>
                <TextField
                  label="Date de début"
                  type="date"
                  value={startDate ? startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Date de fin"
                  type="date"
                  value={endDate ? endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Carte pour les commandes totales */}
        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box display='flex' alignItems='center' mb={2}>
                <Avatar sx={{ bgcolor: alpha('#2196f3', 0.1), color: '#2196f3', mr: 2 }}>
                  <ShoppingCart />
                </Avatar>
                <Typography variant='h6' color='text.secondary'>
                  Commandes totales
                </Typography>
              </Box>
              <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
                {orderStats?.totalOrders || 0}
              </Typography>
              <Typography color='text.secondary'>
                Période: {orderStats?.period.start === 'Tous' ? 'Toutes périodes' : `${orderStats?.period.start} - ${orderStats?.period.end}`}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Carte pour les produits vendus */}
        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box display='flex' alignItems='center' mb={2}>
                <Avatar sx={{ bgcolor: alpha('#4caf50', 0.1), color: '#4caf50', mr: 2 }}>
                  <Inventory />
                </Avatar>
                <Typography variant='h6' color='text.secondary'>
                  Produits vendus
                </Typography>
              </Box>
              <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
                {orderStats?.totalProducts || 0}
              </Typography>
              <Typography color='text.secondary'>
                Nombre total de produits
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Carte pour le chiffre d'affaires */}
        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box display='flex' alignItems='center' mb={2}>
                <Avatar sx={{ bgcolor: alpha('#ff9800', 0.1), color: '#ff9800', mr: 2 }}>
                  <MonetizationOn />
                </Avatar>
                <Typography variant='h6' color='text.secondary'>
                  Chiffre d'affaires
                </Typography>
              </Box>
              <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
                {orderStats?.globalTotalRevenue.toLocaleString('fr-FR') || 0} F CFA
              </Typography>
              <Typography color='text.secondary'>
                Revenu total
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Carte pour le top produit */}
        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box display='flex' alignItems='center' mb={2}>
                <Avatar sx={{ bgcolor: alpha('#9c27b0', 0.1), color: '#9c27b0', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant='h6' color='text.secondary'>
                  Top Produit
                </Typography>
              </Box>
              <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
                {orderStats?.products[0]?.productName || '-'}
              </Typography>
              <Typography color='text.secondary'>
                {orderStats?.products[0]?.percentageOfTotal.toFixed(1) || 0}% des ventes
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Graphique en barres des top produits */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant='h6' mb={2}>Top 5 des produits par revenus</Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value.toLocaleString('fr-FR')} F CFA`, 'Revenus']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenus" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique en camembert des catégories */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' mb={2}>Répartition par catégorie</Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toLocaleString('fr-FR')} F CFA`, 'Revenus']} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='farmer-select'>Agriculteur</InputLabel>
                    <Select
                      labelId='farmer-select'
                      value={farmerFilter}
                      onChange={e => setFarmerFilter(e.target.value)}
                      input={<OutlinedInput label='Agriculteur' />}
                    >
                      <MenuItem value=''>Tous</MenuItem>
                      {farmers.map(farmer => (
                        <MenuItem key={farmer.id} value={farmer.id}>
                          {`${farmer.firstName} ${farmer.lastName}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='product-select'>Produit</InputLabel>
                    <Select
                      labelId='product-select'
                      value={productFilter}
                      onChange={e => setProductFilter(e.target.value)}
                      input={<OutlinedInput label='Produit' />}
                    >
                      <MenuItem value=''>Tous</MenuItem>
                      {products.map(product => (
                        <MenuItem key={product} value={product}>
                          {product}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='status-select'>Statut</InputLabel>
                    <Select
                      labelId='status-select'
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      input={<OutlinedInput label='Statut' />}
                    >
                      <MenuItem value=''>Tous</MenuItem>
                      {statuses.map(status => (
                        <MenuItem key={status} value={status}>
                          {statusTranslations[status]?.label || status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 4,
                  flexWrap: { xs: 'wrap', sm: 'nowrap' }
                }}
              >
                <TextField
                  placeholder='Rechercher (agriculteur, acheteur, produit)'
                  variant='outlined'
                  size='small'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  sx={{ maxWidth: { sm: '300px' }, width: '100%' }}
                />
              </Box>

              <TableContainer sx={{ overflowX: 'auto', mt: 2 }}>
                <Table aria-label='orders table'>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>№</StyledTableCell>
                      <StyledTableCell>Agriculteur</StyledTableCell>
                      <StyledTableCell>Acheteur</StyledTableCell>
                      <StyledTableCell>Nombre de produits</StyledTableCell>
                      <StyledTableCell>Prix total (F CFA)</StyledTableCell>
                      <StyledTableCell>Statut</StyledTableCell>
                      <StyledTableCell>Date</StyledTableCell>
                      <StyledTableCell>Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(order => (
                      <StyledTableRow key={order.id}>
                        <TableCell>{order.fields.orderNumber}</TableCell>
                        <TableCell>
                          {order.fields.farmerFirstName?.[0]} {order.fields.farmerLastName?.[0]}
                        </TableCell>
                        <TableCell>
                          {order.fields.buyerFirstName?.[0]} {order.fields.buyerLastName?.[0]}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {order.fields.Nbr || order.fields.productName?.length || 0} produit(s)
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {order.fields.totalPrice?.toLocaleString('fr-FR')} F CFA
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusTranslations[order.fields.status]?.label || order.fields.status}
                            color={statusTranslations[order.fields.status]?.color || 'default'}
                            size='small'
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell>{new Date(order.createdTime).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <IconButton
                            color='primary'
                            size='small'
                            onClick={() => handleViewDetails(order.id)}
                            sx={{ marginRight: 1 }}
                          >
                            <VisibilityIcon style={{ fontSize: 22, color: 'var(--mui-palette-text-secondary)' }} />
                          </IconButton>
                          <IconButton
                            color='error'
                            size='small'
                            onClick={() => handleDeleteClick(order.id)}
                          >
                            <DeleteBinLineIcon style={{ fontSize: 22, color: 'var(--mui-palette-error-main)' }} />
                          </IconButton>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component='div'
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description">
        <DialogTitle id="delete-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default OrdersPage
