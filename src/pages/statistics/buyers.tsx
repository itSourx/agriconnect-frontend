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
  IconButton
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
  }
}

type SortField = 'name' | 'amount' | 'lastOrderDate'
type SortOrder = 'asc' | 'desc'

const BuyerStatisticsPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<BuyerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

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
      setSortOrder('asc')
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
    link.setAttribute('download', `mes-produits-achetes-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  // Préparer les données pour les graphiques
  const topProductsData = stats?.stats ? Object.entries(stats.stats.products)
    .slice(0, 5)
    .map(([id, product]) => ({
      name: product.name,
      amount: product.amount,
      quantity: product.quantity,
      category: product.category
    })) : []

  const categoryData = stats?.stats ? Object.entries(stats.stats.categories).map(([category, data]) => ({
    name: category,
    amount: data.amount,
    quantity: data.quantity
  })) : []

  // Préparer les données pour la pagination avec tri
  const productsArray = stats?.stats ? Object.entries(stats.stats.products) : []
  
  // Trier les produits
  const sortedProducts = [...productsArray].sort(([, productA], [, productB]) => {
    let a: any, b: any
    
    switch (sortField) {
      case 'name':
        a = productA.name.toLowerCase()
        b = productB.name.toLowerCase()
        break
      case 'amount':
        a = productA.amount
        b = productB.amount
        break
      case 'lastOrderDate':
        a = new Date(productA.lastOrderDate).getTime()
        b = new Date(productB.lastOrderDate).getTime()
        break
      default:
        return 0
    }
    
    if (sortOrder === 'asc') {
      return a < b ? -1 : a > b ? 1 : 0
    } else {
      return a > b ? -1 : a < b ? 1 : 0
    }
  })
  
  const paginatedProducts = sortedProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <UnfoldMore fontSize="small" sx={{ opacity: 0.5 }} />
    }
    return sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
  }

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
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Mes Statistiques
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
                    <ShoppingCart />
                  </Avatar>
                  <Typography variant="h6" color="text.secondary">
                    Commandes totales
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats?.stats.totalOrders || 0}
                </Typography>
                <Typography color="text.secondary">
                  Nombre de commandes passées
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
                    Produits achetés
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats?.stats.totalProducts || 0}
                </Typography>
                <Typography color="text.secondary">
                  Types de produits différents
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
                    Total dépensé
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats?.stats.totalSpent?.toLocaleString('fr-FR') || 0} F CFA
                </Typography>
                <Typography color="text.secondary">
                  Montant total des achats
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
                    Panier moyen
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats?.stats.averageOrderValue?.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) || 0} F CFA
                </Typography>
                <Typography color="text.secondary">
                  Valeur moyenne par commande
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
                <Typography variant="h6" mb={2}>Top 5 des produits achetés</Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={topProductsData}
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
                          if (value.length > 15) {
                            return value.substring(0, 15) + '...'
                          }
                          return value
                        }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value.toLocaleString('fr-FR')} F CFA`, 'Montant']} />
                      <Legend />
                      <Bar dataKey="amount" fill="#8884d8" name="Montant dépensé" />
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
                        dataKey="amount"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value.toLocaleString('fr-FR')} F CFA`, 'Montant']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Détail des produits achetés */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Détail des produits achetés</Typography>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={exportToCSV}
                disabled={!stats?.stats?.products || Object.keys(stats.stats.products).length === 0}
              >
                Exporter en CSV
              </Button>
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'primary.main',
                            '& .MuiSvgIcon-root': {
                              opacity: 1
                            }
                          }
                        }} 
                        onClick={() => handleSort('name')}
                      >
                        Produit
                        <IconButton size="small" sx={{ ml: 0.5 }}>
                          {getSortIcon('name')}
                        </IconButton>
                      </Box>
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Catégorie</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Prix unitaire</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Quantité</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'primary.main',
                            '& .MuiSvgIcon-root': {
                              opacity: 1
                            }
                          }
                        }} 
                        onClick={() => handleSort('amount')}
                      >
                        Montant total
                        <IconButton size="small" sx={{ ml: 0.5 }}>
                          {getSortIcon('amount')}
                        </IconButton>
                      </Box>
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'primary.main',
                            '& .MuiSvgIcon-root': {
                              opacity: 1
                            }
                          }
                        }} 
                        onClick={() => handleSort('lastOrderDate')}
                      >
                        Dernière commande
                        <IconButton size="small" sx={{ ml: 0.5 }}>
                          {getSortIcon('lastOrderDate')}
                        </IconButton>
                      </Box>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map(([productId, product]) => (
                    <tr key={productId} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        {product.name}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Chip label={product.category} size="small" variant="outlined" />
                      </td>
                      <td style={{ padding: '12px' }}>
                        {product.price.toLocaleString('fr-FR')} F CFA
                      </td>
                      <td style={{ padding: '12px' }}>
                        {product.quantity}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>
                        {product.amount.toLocaleString('fr-FR')} F CFA
                      </td>
                      <td style={{ padding: '12px' }}>
                        {new Date(product.lastOrderDate).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
            
            {/* Pagination */}
            {productsArray.length > 0 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <TablePagination
                  component="div"
                  count={productsArray.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Produits par page :"
                  labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                  }
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default BuyerStatisticsPage 