import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  MonetizationOn as MonetizationOnIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  LocalOffer as LocalOfferIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from 'src/configs/constants'
import { exportToCSV } from 'src/utils/csvExport'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts'

// Types pour les données de l'API
interface FarmerStats {
  success: boolean
  farmerId: string
  period: {
    start: string
    end: string
  }
  stats: {
    farmerName: string
    farmerEmail: string
    totalSales: number
    totalProductsSold: number
    totalRevenue: number
    averageSaleValue: number
    bestSellingProduct: string
    bestSellingProductName: string
    products: {
      [productId: string]: {
        productName: string
        quantitySold: number
        revenue: number
        lastSaleDate: string
        buyers: {
          [buyerId: string]: {
            buyerName: string
            quantity: number
          }
        }
      }
    }
    buyers: {
      [buyerId: string]: {
        buyerName: string
        quantity: number
        amount: number
      }
    }
    salesTimeline: Array<{
      date: string
      amount: number
      productCount: number
    }>
  }
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.1)'
  }
}))

const StatCard = ({ title, value, icon, color, subtitle, onClick }: {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  subtitle?: string
  onClick?: () => void
}) => (
  <StyledCard 
    sx={{ 
      height: '100%', 
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px 0 rgba(0,0,0,0.15)'
      } : {}
    }}
    onClick={onClick}
  >
    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ color: color, mr: 2, display: 'flex', alignItems: 'center' }}>
          {icon}
        </Box>
        <Typography variant='h6' color='text.secondary'>
          {title}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant='h4' sx={{ fontWeight: 'bold', color: color }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {onClick && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowForwardIcon />}
            sx={{
              color: color,
              borderColor: color,
              '&:hover': {
                backgroundColor: alpha(color, 0.1),
                borderColor: color
              }
            }}
          >
            Voir
          </Button>
        </Box>
      )}
    </CardContent>
  </StyledCard>
)

const DashboardAgriculteur = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<FarmerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [buyersModalOpen, setBuyersModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<{
    productName: string
    buyers: { [buyerId: string]: { buyerName: string; quantity: number } }
  } | null>(null)

  // Gérer l'état de chargement initial
  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
    } else if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else {
      setLoading(false)
    }
  }, [status, router])

  const fetchStats = async () => {
    if (!session?.user?.id || !session?.accessToken) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('Fetching stats for farmer:', session.user.id)

      const response = await fetch(
        `${API_BASE_URL}/orders/stats/farmers/${session.user.id}`,
        {
          headers: {
            'accept': '*/*',
            'Authorization': `bearer ${session.accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques')
      }

      const data: FarmerStats = await response.json()
      console.log('Farmer stats:', data)
      setStats(data)
    } catch (err: any) {
      console.error('Error fetching stats:', err)
      if (err.response?.status === 401) {
        router.push('/auth/login')
        return
      }
      setError('Erreur lors du chargement des statistiques')
      toast.error('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchStats()
    }
  }, [session?.user?.id])

  // Écouter les changements de route pour mettre à jour les données
  useEffect(() => {
    const handleRouteChange = () => {
      if (session?.user?.id) {
        fetchStats()
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router, session?.user?.id])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOpenBuyersModal = (productId: string) => {
    if (stats?.stats?.products[productId]) {
      const product = stats.stats.products[productId]
      setSelectedProduct({
        productName: product.productName,
        buyers: product.buyers
      })
      setBuyersModalOpen(true)
    }
  }

  const handleCloseBuyersModal = () => {
    setBuyersModalOpen(false)
    setSelectedProduct(null)
  }

  const handleExportCSV = () => {
    if (!stats?.stats?.products) {
      toast.error('Aucune donnée à exporter')
      return
    }

    const exportData = Object.entries(stats.stats.products).map(([productId, product]) => ({
      'Nom du produit': product.productName,
      'Quantité vendue': product.quantitySold,
      'Revenus (FCFA)': product.revenue,
      'Dernière vente': new Date(product.lastSaleDate).toLocaleDateString('fr-FR'),
      'Nombre de clients': Object.keys(product.buyers).length
    }))

    exportToCSV(exportData, `produits_vendus_${stats.stats.farmerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`)
    toast.success('Export CSV généré avec succès')
  }

  if (status === 'loading' || loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity='error'>{error}</Alert>
      </Box>
    )
  }

  // Si pas de données, afficher un message
  if (!stats) {
    return (
      <Box p={3}>
        <Typography variant='h4' gutterBottom>
          Tableau de bord
        </Typography>
        <Alert severity='info'>
          Bienvenue ! Commencez par ajouter vos premiers produits pour voir vos statistiques.
        </Alert>
        <Box mt={3}>
          <Button
            variant='contained'
            color='primary'
            startIcon={<InventoryIcon />}
            onClick={() => router.push('/products/myproducts')}
          >
            Ajouter mon premier produit
          </Button>
        </Box>
      </Box>
    )
  }

  const { stats: farmerStats } = stats

  // Calculer les statistiques dérivées
  const totalProducts = Object.keys(farmerStats.products).length
  const totalBuyers = Object.keys(farmerStats.buyers).length
  const topProducts = Object.entries(farmerStats.products)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5)
  const topBuyers = Object.entries(farmerStats.buyers)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 5)

  // Préparer les données pour le tableau des produits
  const productsForTable = Object.entries(farmerStats.products).map(([productId, product]) => ({
    id: productId,
    name: product.productName,
    quantitySold: product.quantitySold,
    revenue: product.revenue,
    lastSaleDate: product.lastSaleDate,
    buyersCount: Object.keys(product.buyers).length
  }))

  // Pagination pour le tableau des produits
  const paginatedProducts = productsForTable.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  return (
    <Box p={3}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
          Tableau de bord
        </Typography>
      </Box>

      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ventes totales"
            value={farmerStats.totalSales}
            icon={<ShoppingCartIcon sx={{ fontSize: 28 }} />}
            color="#4caf50"
            subtitle={`${farmerStats.totalProductsSold} produits vendus`}
            onClick={() => router.push('/orders/myorders')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenus totaux"
            value={`${farmerStats.totalRevenue.toLocaleString('fr-FR')} FCFA`}
            icon={<MonetizationOnIcon sx={{ fontSize: 28 }} />}
            color="#2196f3"
            subtitle={`Moyenne: ${farmerStats.averageSaleValue.toLocaleString('fr-FR')} FCFA/vente`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Produits vendus"
            value={totalProducts}
            icon={<InventoryIcon sx={{ fontSize: 28 }} />}
            color="#ff9800"
            subtitle={`${farmerStats.totalProductsSold} unités vendues`}
            onClick={() => router.push('/products/myproducts')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Clients"
            value={totalBuyers}
            icon={<PeopleIcon sx={{ fontSize: 28 }} />}
            color="#9c27b0"
            subtitle=""
            onClick={() => router.push('/customers')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Produit le plus vendu */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <StarIcon sx={{ color: '#ffc107', mr: 1, fontSize: 28 }} />
                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                  Produit vedette
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#ffc107', mb: 1 }}>
                  {farmerStats.bestSellingProductName}
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  Votre produit le plus performant
                </Typography>
              </Box>
              <Button
                variant='outlined'
                color='primary'
                startIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/products/myproducts')}
                fullWidth
              >
                Voir tous mes produits
              </Button>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Timeline des ventes - Graphique */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TimelineIcon sx={{ color: '#4caf50', mr: 1, fontSize: 28 }} />
                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                  Évolution des ventes
                </Typography>
              </Box>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={farmerStats.salesTimeline.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                    />
                    <RechartsTooltip 
                      formatter={(value: any) => [`${value.toLocaleString('fr-FR')} FCFA`, 'Ventes']}
                      labelFormatter={(label: any) => new Date(label).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#4caf50" 
                      strokeWidth={3}
                      dot={{ fill: '#4caf50', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#4caf50', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Top 5 des produits */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CategoryIcon sx={{ color: '#2196f3', mr: 1, fontSize: 28 }} />
                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                  Top 5 des produits
                </Typography>
              </Box>
              <List>
                {topProducts.map(([productId, product], index) => (
                  <ListItem key={productId} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: index === 0 ? '#ffc107' : '#e0e0e0', color: index === 0 ? '#000' : '#666' }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={product.productName}
                      secondary={`${product.quantitySold} unités vendues`}
                    />
                    <Typography variant='body2' sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                      {product.revenue.toLocaleString('fr-FR')} FCFA
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Top 5 des clients - avec numéros au lieu d'icônes */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PeopleIcon sx={{ color: '#9c27b0', mr: 1, fontSize: 28 }} />
                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                  Top 5 des clients
                </Typography>
              </Box>
              <List>
                {topBuyers.map(([buyerId, buyer], index) => (
                  <ListItem key={buyerId} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: index === 0 ? '#ffc107' : '#e0e0e0', color: index === 0 ? '#000' : '#666' }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={buyer.buyerName}
                      secondary={`${buyer.quantity} unités achetées`}
                    />
                    <Typography variant='body2' sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                      {buyer.amount.toLocaleString('fr-FR')} FCFA
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Détail des produits vendus - Tableau avec pagination */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InventoryIcon sx={{ color: '#ff9800', mr: 1, fontSize: 28 }} />
                  <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                    Produits vendus
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCSV}
                  disabled={!stats?.stats?.products}
                >
                  Exporter en CSV
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Produit</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Revenus</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Dernière vente</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Clients</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>
                          <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                            {product.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant='body2' sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                            {product.revenue.toLocaleString('fr-FR')} FCFA
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant='body2' color='text.secondary'>
                            {new Date(product.lastSaleDate).toLocaleDateString('fr-FR')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant='body2' color='text.secondary'>
                            {product.buyersCount}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Voir les acheteurs">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenBuyersModal(product.id)}
                              sx={{ color: '#2196f3' }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={productsForTable.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Lignes par page:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              />
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Modale pour afficher les acheteurs d'un produit */}
      <Dialog
        open={buyersModalOpen}
        onClose={handleCloseBuyersModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 1, color: '#2196f3' }} />
            <Typography variant="h6">
              Acheteurs - {selectedProduct?.productName}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <List>
              {Object.entries(selectedProduct.buyers).map(([buyerId, buyer], index) => (
                <ListItem key={buyerId} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#2196f3', color: 'white' }}>
                      {buyer.buyerName.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={buyer.buyerName}
                    secondary={`Quantité achetée: ${buyer.quantity}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBuyersModal} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DashboardAgriculteur
