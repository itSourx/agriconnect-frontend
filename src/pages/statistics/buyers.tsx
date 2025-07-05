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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'
import {
  ShoppingCart,
  People,
  MonetizationOn,
  TrendingUp,
  CalendarToday,
  ArrowBack,
  ExpandMore,
  Email,
  Category
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
  success: boolean
  period: {
    start: string
    end: string
  }
  totalBuyers: number
  globalTotalRevenue: number
  buyers: Array<{
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
  }>
}

const BuyersStatisticsPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<BuyerStats | null>(null)
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
      let url = `${API_BASE_URL}/orders/stats/buyers`
      
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
          Statistiques par Acheteur
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
                  Montant total dépensé
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats?.globalTotalRevenue.toLocaleString('fr-FR') || 0} F CFA
              </Typography>
              <Typography color="text.secondary">
                Total des achats
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
              <Typography variant="h6" mb={2}>Top 5 des acheteurs par montant dépensé</Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topBuyersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value.toLocaleString('fr-FR')} F CFA`, 'Montant dépensé']} />
                    <Legend />
                    <Bar dataKey="spent" fill="#8884d8" name="Montant dépensé" />
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
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="spent"
                    >
                      {buyerSpentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toLocaleString('fr-FR')} F CFA`, 'Montant dépensé']} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Détail des acheteurs */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={3}>Détail des acheteurs</Typography>
          {stats?.buyers.map((buyer, index) => (
            <Accordion key={buyer.buyerId} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Chip 
                    label={`#${index + 1}`} 
                    size="small" 
                    sx={{ mr: 2, bgcolor: COLORS[index % COLORS.length], color: 'white' }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{buyer.buyerName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {buyer.buyerEmail}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', mr: 2 }}>
                    <Typography variant="h6" color="primary">
                      {buyer.totalSpent.toLocaleString('fr-FR')} F CFA
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {buyer.percentageOfTotalSpent.toFixed(1)}% du total
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Statistiques générales</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Nombre de commandes" 
                          secondary={buyer.totalOrders}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Nombre de produits" 
                          secondary={buyer.totalProducts}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Montant total dépensé" 
                          secondary={`${buyer.totalSpent.toLocaleString('fr-FR')} F CFA`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Catégorie préférée" 
                          secondary={
                            <Chip 
                              label={buyer.favoriteCategory} 
                              size="small" 
                              icon={<Category />}
                              color="primary"
                            />
                          }
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Répartition par catégorie</Typography>
                    <List dense>
                      {buyer.categoryStats.map((categoryStat) => (
                        <ListItem key={categoryStat.category}>
                          <ListItemText 
                            primary={categoryStat.category}
                            secondary={`${categoryStat.quantity} unités - ${categoryStat.amount.toLocaleString('fr-FR')} F CFA (${categoryStat.percentage.toFixed(1)}%)`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>Produits achetés</Typography>
                    <List dense>
                      {Object.entries(buyer.products).map(([productId, product]) => (
                        <ListItem key={productId}>
                          <ListItemText 
                            primary={product.name}
                            secondary={`${product.quantity} ${product.category} - ${product.amount.toLocaleString('fr-FR')} F CFA`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    </Box>
  )
}

export default BuyersStatisticsPage 