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
  Chip
} from '@mui/material'
import {
  ShoppingCart,
  Inventory,
  MonetizationOn,
  TrendingUp,
  CalendarToday,
  ArrowBack
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

const GlobalStatisticsPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

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
      let url = `${API_BASE_URL}/orders/stats`
      
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  // Préparer les données pour les graphiques
  const topProductsData = stats?.products.slice(0, 5).map(product => ({
    name: product.productName,
    revenue: product.totalRevenue,
    percentage: product.percentageOfTotal
  })) || []

  const categoryData = stats?.products.reduce((acc, product) => {
    const category = product.category
    const existing = acc.find(item => item.name === category)
    if (existing) {
      existing.value += product.totalRevenue
    } else {
      acc.push({ name: category, value: product.totalRevenue })
    }
    return acc
  }, [] as { name: string; value: number }[]) || []

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
          Statistiques Globales
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
              onClick={() => {
                setStartDate(null)
                setEndDate(null)
              }}
              fullWidth
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
                  <ShoppingCart />
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  Commandes totales
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats?.totalOrders || 0}
              </Typography>
              <Typography color="text.secondary">
                Période: {stats?.period.start === 'Tous' ? 'Toutes périodes' : `${stats?.period.start} - ${stats?.period.end}`}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: alpha('#4caf50', 0.1), color: '#4caf50', mr: 2 }}>
                  <Inventory />
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  Produits vendus
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats?.totalProducts || 0}
              </Typography>
              <Typography color="text.secondary">
                Nombre total de produits
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
                Revenu total
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
                  Top Produit
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats?.products[0]?.productName || '-'}
              </Typography>
              <Typography color="text.secondary">
                {stats?.products[0]?.percentageOfTotal.toFixed(1) || 0}% des ventes
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={3}>
        {/* Graphique en barres des top produits */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Top 5 des produits par revenus</Typography>
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
              <Typography variant="h6" mb={2}>Répartition par catégorie</Typography>
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

      {/* Tableau détaillé des produits */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" mb={3}>Détail des produits</Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Produit</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Catégorie</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Commandes</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Quantité</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Revenus</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>% du total</th>
                </tr>
              </thead>
              <tbody>
                {stats?.products.map((product, index) => (
                  <tr key={product.productId} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={`#${index + 1}`} 
                          size="small" 
                          sx={{ mr: 1, bgcolor: COLORS[index % COLORS.length], color: 'white' }}
                        />
                        {product.productName}
                      </Box>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Chip label={product.category} size="small" variant="outlined" />
                    </td>
                    <td style={{ padding: '12px' }}>{product.orderCount}</td>
                    <td style={{ padding: '12px' }}>{product.totalQuantity} {product.mesure}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      {product.totalRevenue.toLocaleString('fr-FR')} F CFA
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Chip 
                        label={`${product.percentageOfTotal.toFixed(1)}%`} 
                        size="small" 
                        color="primary"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default GlobalStatisticsPage 