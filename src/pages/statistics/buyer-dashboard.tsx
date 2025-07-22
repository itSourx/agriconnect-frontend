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
  IconButton,
  Container
} from '@mui/material'
import {
  ShoppingCart,
  MonetizationOn,
  TrendingUp,
  CalendarToday,
  ArrowBack,
  RestartAlt,
  Inventory,
  Download,
  ArrowUpward,
  ArrowDownward,
  UnfoldMore
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
  Cell,
  LineChart,
  Line
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

interface OrderTimelineItem {
  date: string
  amount: number
  productCount: number
}

interface BuyerStats {
  success: boolean
  buyerId: string
  period: {
    start: string
    end: string
  }
  stats: {
    buyerName: string
    buyerEmail: string
    totalOrders: number
    totalProducts: number
    totalSpent: number
    averageOrderValue: number
    favoriteCategory: string
    products: {
      [key: string]: {
        name: string
        category: string
        price: number
        quantity: number
        amount: number
        lastOrderDate: string
      }
    }
    categories: {
      [key: string]: {
        name: string
        category: string
        price: number
        quantity: number
        amount: number
      }
    }
    orderTimeline: OrderTimelineItem[]
  }
}

type SortField = 'name' | 'amount' | 'lastOrderDate'
type SortOrder = 'asc' | 'desc'

const BuyerDashboardPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<BuyerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortField, setSortField] = useState<SortField>('lastOrderDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Vérifier les permissions - uniquement pour les acheteurs
  const hasPermission = session?.user?.profileType === 'ACHETEUR'

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

      let url = `${API_BASE_URL}/orders/stats/buyers/${session?.user?.id}`
      
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
      console.log(data)
      console.log("--------------------------------")
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      // Pour "Dernière commande", commencer par ordre décroissant (plus récent en premier)
      setSortOrder(field === 'lastOrderDate' ? 'desc' : 'asc')
    }
    setPage(0)
  }

  const exportToCSV = () => {
    if (!stats?.stats?.products) return

    const products = Object.entries(stats.stats.products).map(([id, product]) => ({
      Nom: product.name,
      Catégorie: product.category,
      'Prix unitaire (F CFA)': product.price,
      'Quantité achetée': product.quantity,
      'Montant total (F CFA)': product.amount,
      'Dernière commande': new Date(product.lastOrderDate).toLocaleDateString('fr-FR')
    }))

    const headers = ['Nom', 'Catégorie', 'Prix unitaire (F CFA)', 'Quantité achetée', 'Montant total (F CFA)', 'Dernière commande']
    const csvContent = [
      headers.join(','),
      ...products.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `statistiques_achats_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <UnfoldMore />
    return sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />
  }

  const sortedProducts = stats?.stats?.products 
    ? Object.entries(stats.stats.products)
        .map(([id, product]) => ({ id, ...product }))
        .sort((a, b) => {
          let aValue: string | number
          let bValue: string | number
          
          switch (sortField) {
            case 'name':
              aValue = a.name.toLowerCase()
              bValue = b.name.toLowerCase()
              break
            case 'amount':
              aValue = a.amount
              bValue = b.amount
              break
            case 'lastOrderDate':
              aValue = new Date(a.lastOrderDate).getTime()
              bValue = new Date(b.lastOrderDate).getTime()
              break
            default:
              return 0
          }
          
          if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
          }
        })
    : []

  const paginatedProducts = sortedProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  if (!hasPermission) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h4" color="error" gutterBottom>
          Accès refusé
        </Typography>
        <Typography variant="body1">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </Typography>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
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
      </Container>
    )
  }

  if (!stats) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Aucune donnée disponible
        </Typography>
      </Container>
    )
  }

  // Préparer les données pour les graphiques à partir des vraies données de l'API
  const categoryData = stats?.stats?.categories 
    ? Object.entries(stats.stats.categories).map(([categoryName, category]) => ({
        name: categoryName,
        value: category.amount,
        quantity: category.quantity
      }))
    : []

  // Utiliser orderTimeline pour créer les données mensuelles
  const timelineData = stats?.stats?.orderTimeline || []
  
  // Grouper par mois et calculer les totaux
  const monthlyData = timelineData.reduce((acc, item) => {
    const date = new Date(item.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('fr-FR', { month: 'short' })
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        orders: 0,
        amount: 0,
        productCount: 0
      }
    }
    
    acc[monthKey].orders += 1
    acc[monthKey].amount += item.amount
    acc[monthKey].productCount += item.productCount
    
    return acc
  }, {} as Record<string, { month: string; orders: number; amount: number; productCount: number }>)

  const monthlyChartData = Object.values(monthlyData).sort((a, b) => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
    return months.indexOf(a.month) - months.indexOf(b.month)
  })

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Mon Tableau de Bord
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Analyse de mes achats et comportements d'achat
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          <ArrowBack sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body1">
            Retour au marché
          </Typography>
        </Box>
      </Box>

      {/* Filtres de date */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Période d'analyse
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Date de début"
              type="date"
              value={startDate ? startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Date de fin"
              type="date"
              value={endDate ? endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RestartAlt />}
              onClick={fetchStats}
              sx={{
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                }
              }}
            >
              Appliquer les filtres
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#2196f3', 0.1), color: '#2196f3', mr: 2 }}>
                  <ShoppingCart />
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  Commandes
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                {stats?.stats?.totalOrders || 0}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#4caf50', 0.1), color: '#4caf50', mr: 2 }}>
                  <Inventory />
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  Produits
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {stats?.stats?.totalProducts || 0}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#ff9800', 0.1), color: '#ff9800', mr: 2 }}>
                  <MonetizationOn />
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  Total dépensé
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {stats?.stats?.totalSpent?.toLocaleString('fr-FR') || '0'} F CFA
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#9c27b0', 0.1), color: '#9c27b0', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  Panier moyen
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                {stats?.stats?.averageOrderValue?.toLocaleString('fr-FR') || '0'} F CFA
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Évolution des commandes par mois
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'amount' ? `${value.toLocaleString('fr-FR')} F CFA` : value,
                    name === 'amount' ? 'Montant' : name === 'orders' ? 'Commandes' : 'Produits'
                  ]} />
                  <Legend />
                  <Bar dataKey="orders" fill="#2196f3" name="Commandes" />
                  <Bar dataKey="amount" fill="#4caf50" name="Montant (F CFA)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Répartition par catégorie
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString('fr-FR')} F CFA`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Tableau des produits */}
      <StyledCard>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Détail des produits achetés
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportToCSV}
              disabled={!stats?.stats?.products}
            >
              Exporter en CSV
            </Button>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    <Button
                      onClick={() => handleSort('name')}
                      endIcon={getSortIcon('name')}
                      sx={{ textTransform: 'none', fontWeight: 'bold' }}
                    >
                      Nom du produit
                    </Button>
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Catégorie</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Prix unitaire</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Quantité</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    <Button
                      onClick={() => handleSort('amount')}
                      endIcon={getSortIcon('amount')}
                      sx={{ textTransform: 'none', fontWeight: 'bold' }}
                    >
                      Montant total
                    </Button>
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    <Button
                      onClick={() => handleSort('lastOrderDate')}
                      endIcon={getSortIcon('lastOrderDate')}
                      sx={{ textTransform: 'none', fontWeight: 'bold' }}
                    >
                      Dernière commande
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>
                      <Typography variant="body1" fontWeight={500}>
                        {product.name}
                      </Typography>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Chip 
                        label={product.category} 
                        size="small" 
                        sx={{ bgcolor: alpha('#4caf50', 0.1), color: '#4caf50' }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Typography variant="body2">
                        {product.price?.toLocaleString('fr-FR')} F CFA
                      </Typography>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Typography variant="body2">
                        {product.quantity}
                      </Typography>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Typography variant="body1" fontWeight={600} color="primary">
                        {product.amount?.toLocaleString('fr-FR')} F CFA
                      </Typography>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(product.lastOrderDate).toLocaleDateString('fr-FR')}
                      </Typography>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <TablePagination
            component="div"
            count={sortedProducts.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Lignes par page:"
          />
        </CardContent>
      </StyledCard>
    </Container>
  )
}

export default BuyerDashboardPage 