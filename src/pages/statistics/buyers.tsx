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
  TablePagination,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  ShoppingCart,
  MonetizationOn,
  TrendingUp,
  CalendarToday,
  ArrowBack,
  RestartAlt,
  People,
  ExpandMore,
  Inventory,
  Email
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

interface BuyerStats {
  buyerId: string
  buyerName: string
  buyerEmail: string
  totalOrders: number
  totalProducts: number
  totalSpent: number
  favoriteCategory: string
  products: {
    [key: string]: {
      name: string
      category: string
      price: number
      quantity: number
      amount: number
    }
  }
  categories: {
    [key: string]: {
      quantity: number
      amount: number
    }
  }
  percentageOfTotalSpent: number
  categoryStats: Array<{
    category: string
    quantity: number
    amount: number
    percentage: number
  }>
}

interface AllBuyersStats {
  success: boolean
  period: {
    start: string
    end: string
  }
  totalBuyers: number
  globalTotalRevenue: number
  buyers: BuyerStats[]
}

const BuyersStatisticsPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AllBuyersStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Vérifier les permissions - uniquement pour les admins
  const hasPermission = session?.user?.profileType === 'ADMIN' || session?.user?.profileType === 'SUPERADMIN'

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
      const token = session?.accessToken
      if (!token) {
        throw new Error('Token non disponible')
      }

      let url = `${API_BASE_URL}/orders/stats/buyers`
      
      if (startDate && endDate) {
        const params = new URLSearchParams({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        })
        url += `?${params.toString()}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `bearer ${token}`,
          'Accept': '*/*'
        }
      })
      
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

  // Calculer les acheteurs à afficher pour la pagination
  const paginatedBuyers = stats?.buyers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  ) || []

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  // Préparer les données pour les graphiques
  const topBuyersData = stats?.buyers.slice(0, 5).map(buyer => ({
    name: buyer.buyerName,
    spent: buyer.totalSpent,
    orders: buyer.totalOrders,
    percentage: buyer.percentageOfTotalSpent
  })) || []

  const buyerSpentData = stats?.buyers.map(buyer => ({
    name: buyer.buyerName,
    spent: buyer.totalSpent,
    orders: buyer.totalOrders
  })) || []

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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={fetchStats}
          startIcon={<RestartAlt />}
        >
          Réessayer
        </Button>
      </Box>
    )
  }

  if (!stats) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="text.secondary">
          Aucune donnée disponible
        </Typography>
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
          Statistiques clients
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
                  Acheteurs actifs
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats?.totalBuyers || 0}
              </Typography>
              <Typography color="text.secondary">
                Acheteurs avec des commandes
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
                {stats?.buyers.reduce((sum, buyer) => sum + buyer.totalOrders, 0) || 0}
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
                Revenu total des ventes
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
                  Top Acheteur
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats?.buyers[0]?.buyerName || '-'}
              </Typography>
              <Typography color="text.secondary">
                {stats?.buyers[0]?.percentageOfTotalSpent.toFixed(1) || 0}% des achats
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Graphique en barres des top acheteurs */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Top 5 des acheteurs par dépenses</Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={topBuyersData}
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
                      formatter={(value) => [`${value.toLocaleString('fr-FR')} F CFA`, 'Dépenses']}
                      labelFormatter={(label) => {
                        // Afficher le nom complet dans le tooltip
                        const buyer = topBuyersData.find(b => b.name === label)
                        return buyer ? buyer.name : label
                      }}
                    />
                    <Legend />
                    <Bar dataKey="spent" fill="#8884d8" name="Dépenses" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique en camembert des dépenses par acheteur */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Répartition des dépenses</Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={buyerSpentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="spent"
                    >
                      {buyerSpentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toLocaleString('fr-FR')} F CFA`, 'Dépenses']} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Liste des acheteurs */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={3}>Liste des acheteurs</Typography>
          
          {paginatedBuyers.map((buyer, index) => (
            <Accordion key={buyer.buyerId} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, bgcolor: alpha('#2196f3', 0.1), color: '#2196f3' }}>
                        {buyer.buyerName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {buyer.buyerName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {buyer.buyerEmail}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography variant="body2" color="text.secondary">
                      Commandes
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {buyer.totalOrders}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography variant="body2" color="text.secondary">
                      Produits
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {buyer.totalProducts}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total dépensé
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {buyer.totalSpent.toLocaleString('fr-FR')} F CFA
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography variant="body2" color="text.secondary">
                      % du total
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {buyer.percentageOfTotalSpent.toFixed(1)}%
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Catégorie préférée */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Catégorie préférée
                    </Typography>
                    <Chip 
                      label={buyer.favoriteCategory} 
                      color="primary" 
                      variant="outlined"
                    />
                  </Grid>

                  {/* Statistiques par catégorie */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Répartition par catégorie
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {buyer.categoryStats.slice(0, 5).map((cat, idx) => (
                        <Chip
                          key={cat.category}
                          label={`${cat.category}: ${cat.percentage.toFixed(1)}%`}
                          size="small"
                          sx={{ bgcolor: alpha(COLORS[idx % COLORS.length], 0.1) }}
                        />
                      ))}
                    </Box>
                  </Grid>

                  {/* Produits achetés */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Produits achetés
                    </Typography>
                    <Grid container spacing={1}>
                      {Object.entries(buyer.products).map(([id, product]) => (
                        <Grid item xs={12} sm={6} md={4} key={id}>
                          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="body2" fontWeight="bold">
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.category} • {product.quantity} × {product.price.toLocaleString('fr-FR')} F CFA
                            </Typography>
                            <Typography variant="body2" color="success.main" fontWeight="bold">
                              {product.amount.toLocaleString('fr-FR')} F CFA
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}

          <TablePagination
            component="div"
            count={stats.buyers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Lignes par page:"
          />
        </CardContent>
      </Card>
    </Box>
  )
}

export default BuyersStatisticsPage 