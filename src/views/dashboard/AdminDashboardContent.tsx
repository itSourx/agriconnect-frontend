import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, CircularProgress, Divider, List, ListItem, ListItemText
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StoreIcon from '@mui/icons-material/Store';
import CategoryIcon from '@mui/icons-material/Category';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import PersonIcon from '@mui/icons-material/Person';

const API = 'https://agriconnect-bc17856a61b8.herokuapp.com';

const AdminDashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all users, orders, products
        const [usersRes, ordersRes, productsRes] = await Promise.all([
          fetch(`${API}/users`).then(r => r.json()),
          fetch(`${API}/orders`).then(r => r.json()),
          fetch(`${API}/products`).then(r => r.json()),
        ]);

        // Users breakdown
        const totalUsers = usersRes.length;
        const buyers = usersRes.filter((u: any) => u.fields.profileType === 'ACHETEUR');
        const farmers = usersRes.filter((u: any) => u.fields.profileType === 'AGRICULTEUR');
        const admins = usersRes.filter((u: any) => u.fields.profileType === 'ADMIN');

        // Orders breakdown
        const totalOrders = ordersRes.length;
        const totalRevenue = ordersRes.reduce((sum: number, o: any) => sum + (parseFloat(o.totalAmount) || 0), 0);

        // Products breakdown
        const totalProducts = productsRes.length;
        const categories = [...new Set(productsRes.map((p: any) => p.fields.category).filter(Boolean))];
        const totalCategories = categories.length;

        // Chiffre d'affaires par agriculteur
        const farmerStats: Record<string, { name: string, revenue: number, orders: number }> = {};
        ordersRes.forEach((order: any) => {
          const farmerId = order.farmerId?.[0];
          if (!farmerId) return;
          const farmer = farmers.find((f: any) => f.id === farmerId);
          const name = farmer ? `${farmer.fields.FirstName} ${farmer.fields.LastName}` : 'Inconnu';
          if (!farmerStats[farmerId]) {
            farmerStats[farmerId] = { name, revenue: 0, orders: 0 };
          }
          farmerStats[farmerId].revenue += parseFloat(order.totalAmount) || 0;
          farmerStats[farmerId].orders += 1;
        });
        const topFarmers = Object.entries(farmerStats)
          .sort((a, b) => b[1].revenue - a[1].revenue)
          .slice(0, 5);

        setStats({
          totalUsers,
          totalBuyers: buyers.length,
          totalFarmers: farmers.length,
          totalAdmins: admins.length,
          totalOrders,
          totalProducts,
          totalCategories,
          totalRevenue,
          topFarmers,
          farmerStats,
        });
      } catch (err: any) {
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>;
  }
  if (error) {
    return <Box p={3} color="error.main">{error}</Box>;
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Dashboard Administrateur</Typography>
      </Box>
      <Grid container spacing={3}>
        {/* Cards de stats principales */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <GroupIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h6">Utilisateurs</Typography>
                  <Typography variant="h4">{stats.totalUsers}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PersonIcon color="success" fontSize="large" />
                <Box>
                  <Typography variant="h6">Acheteurs</Typography>
                  <Typography variant="h4">{stats.totalBuyers}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AgricultureIcon color="warning" fontSize="large" />
                <Box>
                  <Typography variant="h6">Agriculteurs</Typography>
                  <Typography variant="h4">{stats.totalFarmers}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AdminPanelSettingsIcon color="info" fontSize="large" />
                <Box>
                  <Typography variant="h6">Admins</Typography>
                  <Typography variant="h4">{stats.totalAdmins}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ShoppingCartIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h6">Commandes</Typography>
                  <Typography variant="h4">{stats.totalOrders}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <StoreIcon color="secondary" fontSize="large" />
                <Box>
                  <Typography variant="h6">Produits</Typography>
                  <Typography variant="h4">{stats.totalProducts}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CategoryIcon color="success" fontSize="large" />
                <Box>
                  <Typography variant="h6">Catégories</Typography>
                  <Typography variant="h4">{stats.totalCategories}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <MonetizationOnIcon color="warning" fontSize="large" />
                <Box>
                  <Typography variant="h6">Chiffre d'affaires</Typography>
                  <Typography variant="h4">{stats.totalRevenue.toLocaleString('fr-FR')} F CFA</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top 5 Agriculteurs par chiffre d'affaires */}
      <Box mt={6}>
        <Typography variant="h5" gutterBottom>Top 5 Agriculteurs (CA)</Typography>
        <Card>
          <CardContent>
            <List>
              {stats.topFarmers.map(([farmerId, data]: any, idx: number) => (
                <ListItem key={farmerId}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{idx + 1}</Avatar>
                  <ListItemText
                    primary={data.name}
                    secondary={`CA: ${data.revenue.toLocaleString('fr-FR')} F CFA | Commandes: ${data.orders}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* Statistiques détaillées par agriculteur */}
      <Box mt={6}>
        <Typography variant="h5" gutterBottom>Statistiques par Agriculteur</Typography>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              {Object.entries(stats.farmerStats).map(([farmerId, data]: any) => (
                <Grid item xs={12} sm={6} md={4} key={farmerId}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600}>{data.name}</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">Chiffre d'affaires : <b>{data.revenue.toLocaleString('fr-FR')} F CFA</b></Typography>
                      <Typography variant="body2">Commandes : <b>{data.orders}</b></Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminDashboardContent; 