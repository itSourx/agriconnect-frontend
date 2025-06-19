import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, CircularProgress, Divider, List, ListItem, ListItemText,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip
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
  AccountBalance as AccountBalanceIcon
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
  YAxis
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
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={topProductsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'revenue') return [`${value.toLocaleString('fr-FR')} FCFA`, 'Revenus'];
                        if (name === 'quantity') return [value, 'Quantité'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2196f3"
                      name="Revenus"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="quantity"
                      stroke="#4caf50"
                      name="Quantité"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Prix moyens par catégorie */}
      <StyledCard>
          <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Prix Moyens par Catégorie</Typography>
      </Box>
          <Grid container spacing={3}>
            {dashboardData.avgPriceByCategory.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.category}>
                <Card 
                  sx={{ 
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha('#2196f3', 0.05)} 0%, ${alpha('#2196f3', 0.1)} 100%)`,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)'
                    }
                  }}
                >
          <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar 
                        sx={{ 
                          bgcolor: alpha('#2196f3', 0.1), 
                          color: '#2196f3',
                          width: 40,
                          height: 40,
                          mr: 2
                        }}
                      >
                        <CategoryIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {category.category}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <LocalOfferIcon sx={{ color: '#4caf50', mr: 1, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            Prix moyen
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          {category.averagePrice.toLocaleString('fr-FR')} FCFA
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Inventory2Icon sx={{ color: '#ff9800', mr: 1, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            Nombre de produits
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                          {category.productCount}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <AccountBalanceIcon sx={{ color: '#9c27b0', mr: 1, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            Valeur totale
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                          {(category.averagePrice * category.productCount).toLocaleString('fr-FR')} FCFA
                        </Typography>
                      </Grid>
                    </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
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