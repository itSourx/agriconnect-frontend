import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, CircularProgress, Divider, List, ListItem, ListItemText,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TablePagination,
  Button, Collapse, IconButton, useTheme, useMediaQuery
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  MonetizationOn as MonetizationOnIcon,
  BarChart as BarChartIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory as InventoryIcon,
  Group as GroupIcon,
  EmojiEvents as EmojiEventsIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Agriculture as AgricultureIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
  Radar as RadarIcon,
  LocalOffer as LocalOfferIcon,
  Inventory2 as Inventory2Icon,
  AccountBalance as AccountBalanceIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useNotifications } from '@/hooks/useNotifications'
import {
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const API = 'https://agriconnect-bc17856a61b8.herokuapp.com';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.1)'
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
  '& .MuiTableHead-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    '& .MuiTableCell-root': {
      borderBottom: 'none',
      fontWeight: 'bold',
      color: theme.palette.text.primary
    }
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      transition: 'background-color 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.02)
      }
    }
  }
}));

interface DashboardData {
  summary: {
    totalProductsSold: number;
    globalTotalAmount: number;
    avgProductValue: number;
  };
  topByQuantity: Array<{
    productId: string;
    totalQuantity: number;
    totalRevenue: number;
    productName: string;
    category: string;
  }>;
  topByRevenue: Array<{
    productId: string;
    totalQuantity: number;
    totalRevenue: number;
    productName: string;
    category: string;
  }>;
  avgPriceByCategory: Array<{
    category: string;
    averagePrice: number;
    productCount: number;
  }>;
  orderStats: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
  };
}

const StatCard = ({ title, value, icon, color, subtitle }: { title: string; value: string | number; icon: React.ReactNode; color: string; subtitle?: string }) => (
  <StyledCard sx={{ height: '100%' }}>
    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, mr: 2 }}>
          {icon}
        </Avatar>
        <Typography variant='h6' color='text.secondary'>
          {title}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </CardContent>
  </StyledCard>
);

const AdminDashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'category' | 'averagePrice' | 'productCount' | 'totalValue'>('averagePrice');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showChart, setShowChart] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { 
    notifySuccess, 
    notifyError,
    notifyProductCreated,
    notifyProductUpdated,
    notifyProductDeleted,
    notifyOrderCreated,
    notifyOrderUpdated,
    notifyOrderDeleted
  } = useNotifications()

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API}/orders/dashboard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données');
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err: any) {
        setError('Erreur lors du chargement des statistiques');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} color="error.main">
        {error}
      </Box>
    );
  }

  if (!dashboardData) {
    return null;
  }

  console.log(dashboardData);

  // Préparation des données pour le graphique en barres des top produits
  const topProductsData = dashboardData.topByRevenue.map(product => ({
    name: product.productName,
    revenue: product.totalRevenue,
    quantity: product.totalQuantity,
    category: product.category
  }));

  // Préparation des données pour le graphique radar des catégories
  const radarData = dashboardData.avgPriceByCategory.map(category => ({
    category: category.category,
    prix: category.averagePrice / 1000, // Conversion en milliers pour une meilleure lisibilité
    produits: category.productCount,
    valeur: (category.averagePrice * category.productCount) / 1000000 // Valeur totale en millions
  }));

  // Fonction de tri
  const sortedCategories = dashboardData?.avgPriceByCategory
    ?.map(category => ({
      ...category,
      totalValue: category.averagePrice * category.productCount
    }))
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    }) || [];

  // Données paginées
  const paginatedCategories = sortedCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Données pour les graphiques
  const chartData = sortedCategories.slice(0, 8).map(category => ({
    name: category.category,
    prix: category.averagePrice / 1000,
    produits: category.productCount,
    valeur: (category.averagePrice * category.productCount) / 1000000
  }));

  const pieData = sortedCategories.slice(0, 6).map(category => ({
    name: category.category,
    value: category.productCount,
    totalValue: category.averagePrice * category.productCount
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Dashboard Administrateur
        </Typography>
      </Box>

      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Produits vendus"
            value={dashboardData.summary.totalProductsSold.toLocaleString('fr-FR')}
            icon={<InventoryIcon />}
            color="#2196f3"
            subtitle={`Valeur moyenne: ${dashboardData.summary.avgProductValue.toLocaleString('fr-FR')} FCFA`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Chiffre d'affaires"
            value={`${dashboardData.summary.globalTotalAmount.toLocaleString('fr-FR')} FCFA`}
            icon={<MonetizationOnIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Commandes"
            value={dashboardData.orderStats.totalOrders}
            icon={<ShoppingCartIcon />}
            color="#ff9800"
            subtitle={`Valeur moyenne: ${dashboardData.orderStats.avgOrderValue.toLocaleString('fr-FR')} FCFA`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Catégories"
            value={dashboardData.avgPriceByCategory.length}
            icon={<CategoryIcon />}
            color="#9c27b0"
          />
        </Grid>
        </Grid>

      {/* Top produits par quantité et revenus */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BarChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Top Produits vendus par Quantité</Typography>
              </Box>
              <StyledTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Produit</TableCell>
                      <TableCell>Catégorie</TableCell>
                      <TableCell align="right">Quantité</TableCell>
                      <TableCell align="right">Revenus</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.topByQuantity.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>
                          <Chip
                            label={product.category}
                            size="small"
                            sx={{
                              backgroundColor: alpha('#2196f3', 0.1),
                              color: '#2196f3'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">{product.totalQuantity}</TableCell>
                        <TableCell align="right">{product.totalRevenue.toLocaleString('fr-FR')} FCFA</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BarChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Top Produits vendus par Revenus</Typography>
              </Box>
              <StyledTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Produit</TableCell>
                      <TableCell>Catégorie</TableCell>
                      <TableCell align="right">Quantité</TableCell>
                      <TableCell align="right">Revenus</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.topByRevenue.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>
                          <Chip
                            label={product.category}
                            size="small"
                            sx={{
                              backgroundColor: alpha('#2196f3', 0.1),
                              color: '#2196f3'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">{product.totalQuantity}</TableCell>
                        <TableCell align="right">{product.totalRevenue.toLocaleString('fr-FR')} FCFA</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Prix moyens par catégorie - Nouveau design */}
      <StyledCard sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Prix Moyens par Catégorie</Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowChart(!showChart)}
              startIcon={showChart ? <BarChartIcon /> : <CategoryIcon />}
            >
              {showChart ? 'Voir tableau' : 'Voir graphiques'}
            </Button>
          </Box>

          {showChart ? (
            // Vue graphiques
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'prix') return [`${value.toLocaleString('fr-FR')} k FCFA`, 'Prix moyen'];
                          if (name === 'produits') return [value, 'Nombre de produits'];
                          if (name === 'valeur') return [`${value.toLocaleString('fr-FR')} M FCFA`, 'Valeur totale'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="prix" fill="#2196f3" name="Prix moyen (k FCFA)" />
                      <Bar yAxisId="right" dataKey="produits" fill="#4caf50" name="Nombre de produits" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} produits`,
                          props.payload.name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          ) : (
            // Vue tableau
            <>
              <StyledTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          Catégorie
                          <IconButton size="small" onClick={() => handleSort('category')}>
                            <SortIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          Prix moyen
                          <IconButton size="small" onClick={() => handleSort('averagePrice')}>
                            <SortIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          Produits
                          <IconButton size="small" onClick={() => handleSort('productCount')}>
                            <SortIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          Valeur totale
                          <IconButton size="small" onClick={() => handleSort('totalValue')}>
                            <SortIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCategories.map((category) => (
                      <TableRow key={category.category} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha('#2196f3', 0.1), 
                                color: '#2196f3',
                                width: 32,
                                height: 32,
                                mr: 2,
                                fontSize: '0.875rem'
                              }}
                            >
                              {category.category.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {category.category}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                            {category.averagePrice.toLocaleString('fr-FR')} FCFA
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={category.productCount}
                            size="small"
                            sx={{
                              backgroundColor: alpha('#ff9800', 0.1),
                              color: '#ff9800',
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                            {(category.averagePrice * category.productCount).toLocaleString('fr-FR')} FCFA
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={sortedCategories.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Lignes par page:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              />
            </>
          )}
        </CardContent>
      </StyledCard>

      {/* Nouveaux graphiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <RadarIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Performance par Catégorie</Typography>
              </Box>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Prix (k FCFA)"
                      dataKey="prix"
                      stroke="#2196f3"
                      fill="#2196f3"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Produits"
                      dataKey="produits"
                      stroke="#4caf50"
                      fill="#4caf50"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Valeur (M FCFA)"
                      dataKey="valeur"
                      stroke="#ff9800"
                      fill="#ff9800"
                      fillOpacity={0.3}
                    />
                    <Legend />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'Prix (k FCFA)') return [`${value.toLocaleString('fr-FR')} k FCFA`, name];
                        if (name === 'Valeur (M FCFA)') return [`${value.toLocaleString('fr-FR')} M FCFA`, name];
                        return [value, name];
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardContent; 