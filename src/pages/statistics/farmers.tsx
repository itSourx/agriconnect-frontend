import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TablePagination
} from '@mui/material'
import {
  People,
  ShoppingCart,
  MonetizationOn,
  TrendingUp,
  CalendarToday,
  ArrowBack,
  Email,
  ExpandMore,
  Inventory,
  RestartAlt
} from '@mui/icons-material'
import { styled, alpha } from '@mui/material/styles'
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
import { API_BASE_URL } from 'src/configs/constants'

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.1)'
  }
}));

interface FarmerStats {
  period: {
    start: string
    end: string
  }
  totalFarmers: number
  globalTotalRevenue: number
  farmers: Array<{
    farmerId: string
    farmerName: string
    farmerEmail: string
    totalOrders: number
    totalProducts: number
    totalRevenue: number
    products: {
      [key: string]: {
        name: string
        category: string
        price: number
        quantity: number
        revenue: number
      }
    }
    percentageOfTotalRevenue: number
  }>
}

const FarmersStatisticsPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<FarmerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Vérifier les permissions
  const hasPermission = session?.user?.profileType?.includes('ADMIN') || 
                       session?.user?.profileType?.includes('SUPERADMIN')

  useEffect(() => {
    if (!hasPermission) {
      router.push('/')
      return
    }
    fetchStats()
  }, [hasPermission, startDate, endDate])

  const fetchStats = async () => {
    try {
      setLoading(true)
      let url = `${API_BASE_URL}/orders/stats/farmers`
      
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
      setStats(data)
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
      setError('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Calculer les agriculteurs à afficher pour la pagination
  const paginatedFarmers = stats?.farmers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  ) || []

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  // Préparer les données pour les graphiques
  const topFarmersData = stats?.farmers.slice(0, 5).map(farmer => ({
    name: farmer.farmerName,
    revenue: farmer.totalRevenue,
    orders: farmer.totalOrders,
    percentage: farmer.percentageOfTotalRevenue
  })) || []

  const farmerRevenueData = stats?.farmers.map(farmer => ({
    name: farmer.farmerName,
    revenue: farmer.totalRevenue,
    orders: farmer.totalOrders
  })) || []

  if (!hasPermission) {
    return null
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
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/statistics')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Statistiques par Agriculteur
        </Typography>
      </Box>

      {/* Sélecteur de dates */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <CalendarToday color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Période d'analyse</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Date de début"
              type="date"
              value={startDate ? startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Date de fin"
              type="date"
              value={endDate ? endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RestartAlt />}
              onClick={() => {
                setStartDate(null)
                setEndDate(null)
              }}
              sx={{
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                }
              }}
            >
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: alpha('#2196f3', 0.1), color: '#2196f3', mr: 2 }}>
                  <People />
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  Agriculteurs actifs
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats?.totalFarmers || 0}
              </Typography>
              <Typography color="text.secondary">
                Agriculteurs avec des ventes
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: alpha('#4caf50', 0.1), color: '#4caf50', mr: 2 }}>
                  <ShoppingCart />
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  Commandes totales
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats?.farmers.reduce((sum, farmer) => sum + farmer.totalOrders, 0) || 0}
              </Typography>
              <Typography color="text.secondary">
                Toutes commandes confondues
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: alpha('#ff9800', 0.1), color: '#ff9800', mr: 2 }}>
                  <MonetizationOn />
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  Chiffre d'affaires
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats?.globalTotalRevenue.toLocaleString('fr-FR') || 0} F CFA
              </Typography>
              <Typography color="text.secondary">
                Revenu total des agriculteurs
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: alpha('#9c27b0', 0.1), color: '#9c27b0', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  Top Agriculteur
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats?.farmers[0]?.farmerName || '-'}
              </Typography>
              <Typography color="text.secondary">
                {stats?.farmers[0]?.percentageOfTotalRevenue.toFixed(1) || 0}% des ventes
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Graphique en barres des top agriculteurs */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Top 5 des agriculteurs par revenus</Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={topFarmersData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        // Tronquer les noms trop longs
                        if (value.length > 15) {
                          return value.substring(0, 15) + '...'
                        }
                        return value
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString('fr-FR')} F CFA`, 'Revenus']}
                      labelFormatter={(label) => {
                        // Afficher le nom complet dans le tooltip
                        const farmer = topFarmersData.find(f => f.name === label)
                        return farmer ? farmer.name : label
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenus" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique en camembert des revenus par agriculteur */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Répartition des revenus</Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={farmerRevenueData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {farmerRevenueData.map((entry, index) => (
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

      {/* Détail des agriculteurs */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={3}>Détail des agriculteurs</Typography>
          <Grid container spacing={3}>
            {paginatedFarmers.map((farmer, index) => (
              <Grid item xs={12} key={farmer.farmerId}>
                <StyledCard>
                  <CardContent>
                    {/* En-tête de l'agriculteur */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: COLORS[index % COLORS.length], 
                          color: 'white',
                          width: 56,
                          height: 56,
                          mr: 2,
                          fontSize: '1.2rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {farmer.farmerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {farmer.farmerName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {farmer.farmerEmail}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip 
                          label={`#${index + 1}`} 
                          size="small" 
                          sx={{ 
                            bgcolor: COLORS[index % COLORS.length], 
                            color: 'white',
                            mb: 1
                          }}
                        />
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                          {farmer.totalRevenue.toLocaleString('fr-FR')} F CFA
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {farmer.percentageOfTotalRevenue.toFixed(1)}% du total
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Statistiques principales */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                          <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {farmer.totalOrders}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Commandes
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                          <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {farmer.totalProducts}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Produits vendus
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                          <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {Object.keys(farmer.products).length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Types de produits
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Produits vendus */}
                    <Box>
                      <Accordion 
                        elevation={0}
                        sx={{ 
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          '&:before': { display: 'none' }
                        }}
                      >
                        <AccordionSummary 
                          expandIcon={<ExpandMore />}
                          sx={{ 
                            '&:hover': { bgcolor: 'action.hover' },
                            borderRadius: 2
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Inventory sx={{ color: 'primary.main' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              Produits vendus ({Object.keys(farmer.products).length})
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 2 }}>
                          <Grid container spacing={2}>
                            {Object.entries(farmer.products).map(([productId, product]) => (
                              <Grid item xs={12} sm={6} md={4} key={productId}>
                                <Paper 
                                  elevation={0} 
                                  sx={{ 
                                    p: 2, 
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    '&:hover': {
                                      bgcolor: 'action.hover'
                                    }
                                  }}
                                >
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {product.name}
                                  </Typography>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Chip 
                                      label={product.category} 
                                      size="small" 
                                      variant="outlined"
                                      sx={{ fontSize: '0.75rem' }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                      {product.quantity} unités
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                      {product.price.toLocaleString('fr-FR')} F CFA/unité
                                    </Typography>
                                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                                      {product.revenue.toLocaleString('fr-FR')} F CFA
                                    </Typography>
                                  </Box>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {stats?.farmers && stats.farmers.length > 0 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <TablePagination
                component="div"
                count={stats.farmers.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Agriculteurs par page :"
                labelDisplayedRows={({ from, to, count }) => 
                  `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                }
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default FarmersStatisticsPage 