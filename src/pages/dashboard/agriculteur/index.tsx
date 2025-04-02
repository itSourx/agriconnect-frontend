import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
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
  ListItemText
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  MonetizationOn as MonetizationOnIcon,
  Warning as WarningIcon,
  Category as CategoryIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { api } from 'src/configs/api';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalClients: number;
  totalRevenue: number;
  categories: { [key: string]: number };
}

const DashboardAgriculteur = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        // Récupérer les produits
        const productsResponse = await api.get('/products');
        const userProducts = productsResponse.data.filter(
          (p: any) => p.fields.user?.[0] === session.user.id
        );

        // Récupérer les commandes
        const ordersResponse = await api.get('/orders');
        const userOrders = ordersResponse.data.filter(
          (o: any) => o.fields.farmerId?.[0] === session.user.id
        );

        // Calculer les statistiques
        const stats: DashboardStats = {
          totalProducts: userProducts.length,
          lowStockProducts: userProducts.filter((p: any) => parseInt(p.fields.quantity) < 53).length,
          totalOrders: userOrders.length,
          pendingOrders: userOrders.filter((o: any) => o.fields.status === 'En attente').length,
          totalClients: new Set(userOrders.map((o: any) => o.fields.userId?.[0])).size,
          totalRevenue: userOrders.reduce((sum: number, o: any) => sum + (parseFloat(o.fields.totalAmount) || 0), 0),
          categories: userProducts.reduce((acc: { [key: string]: number }, p: any) => {
            acc[p.fields.category] = (acc[p.fields.category] || 0) + 1;
            return acc;
          }, {})
        };

        setStats(stats);
      } catch (err) {
        console.error('Erreur lors de la récupération des statistiques:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord Agriculteur
      </Typography>

      <Grid container spacing={3}>
        {/* Statistiques principales */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Produits</Typography>
              </Box>
              <Typography variant="h4">{stats?.totalProducts || 0}</Typography>
              <Typography color="text.secondary">
                {stats?.lowStockProducts || 0} en stock faible
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/products/myproducts')}
                sx={{ mt: 2 }}
              >
                Gérer les produits
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ShoppingCartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Commandes</Typography>
              </Box>
              <Typography variant="h4">{stats?.totalOrders || 0}</Typography>
              <Typography color="text.secondary">
                {stats?.pendingOrders || 0} en attente
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/orders')}
                sx={{ mt: 2 }}
              >
                Voir les commandes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Clients</Typography>
              </Box>
              <Typography variant="h4">{stats?.totalClients || 0}</Typography>
              <Typography color="text.secondary">
                Clients uniques
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/clients')}
                sx={{ mt: 2 }}
              >
                Voir les clients
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MonetizationOnIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Revenus</Typography>
              </Box>
              <Typography variant="h4">{stats?.totalRevenue.toFixed(2)} F CFA</Typography>
              <Typography color="text.secondary">
                Total des ventes
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/reports')}
                sx={{ mt: 2 }}
              >
                Voir les rapports
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Catégories de produits */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CategoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Catégories de produits</Typography>
              </Box>
              <List>
                {Object.entries(stats?.categories || {}).map(([category, count]) => (
                  <ListItem key={category}>
                    <ListItemText
                      primary={category}
                      secondary={`${count} produit${count > 1 ? 's' : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/products/myproducts')}
                sx={{ mt: 2 }}
              >
                Gérer les catégories
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Produits en stock faible */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Produits en stock faible</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {stats?.lowStockProducts || 0}
              </Typography>
              <Typography color="text.secondary">
                Produits avec moins de 53 unités en stock
              </Typography>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/products/myproducts')}
                sx={{ mt: 2 }}
              >
                Voir les produits en stock faible
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardAgriculteur; 