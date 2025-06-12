// src/pages/orders/orderdetail/[id].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Avatar,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { withAuth } from '@/components/auth/withAuth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { alpha } from '@mui/material/styles';

interface Product {
  productId: string;
  lib: string;
  category: string;
  mesure: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  farmerId: string;
  name: string;
  email: string;
  products: Product[];
  totalAmount: number;
  totalProducts: number;
}

const OrderDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !session?.accessToken) return;

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(
          `https://agriconnect-bc17856a61b8.herokuapp.com/orders/details/${id}`,
          {
            headers: {
              'accept': '*/*',
              'Authorization': `bearer ${session.accessToken}`
            }
          }
        );

        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          router.push('/auth/login');
          return;
        }

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Error response:', errorData);
          throw new Error('Erreur lors de la récupération des détails');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Erreur complète:', error);
        toast.error('Erreur lors de la récupération des détails de la commande');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, session?.accessToken, router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!orders.length) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant='h6'>Commande non trouvée</Typography>
        <Button
          variant='outlined'
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/orders')}
          sx={{ mt: 2 }}
        >
          Retour
        </Button>
      </Box>
    );
  }

  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalProducts = orders.reduce((sum, order) => sum + order.totalProducts, 0);

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => router.push('/orders')}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant='h5'>Détails de la commande #{id}</Typography>
            </Box>
          </Box>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={4}>
                {/* Informations générales */}
                <Grid item xs={12} md={6}>
                  <Typography variant='h6' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                    Informations générales
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: alpha('#2196f3', 0.04), 
                        borderRadius: 2,
                        height: '100%'
                      }}>
                        <Typography variant='body2' color='text.secondary' gutterBottom>
                          Nombre total de produits
                        </Typography>
                        <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                          {totalProducts}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: alpha('#4caf50', 0.04), 
                        borderRadius: 2,
                        height: '100%'
                      }}>
                        <Typography variant='body2' color='text.secondary' gutterBottom>
                          Prix total
                        </Typography>
                        <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          {totalAmount.toLocaleString('fr-FR')} F CFA
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Informations de l'agriculteur */}
                <Grid item xs={12} md={6}>
                  <Typography variant='h6' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                    Informations de l'agriculteur
                  </Typography>
                  <Box sx={{ 
                    p: 3, 
                    bgcolor: alpha('#ff9800', 0.04), 
                    borderRadius: 2,
                    height: '100%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha('#ff9800', 0.1),
                          color: '#ff9800',
                          width: 48,
                          height: 48,
                          mr: 2,
                          fontSize: '1.25rem'
                        }}
                      >
                        {orders[0]?.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                          {orders[0]?.name}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {orders[0]?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Liste des produits */}
          {orders.map((order: Order, index: number) => (
            <Card key={order.farmerId} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant='h6' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                  Détails des produits
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Produit</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Catégorie</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Quantité</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Prix unitaire</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.products.map((product: Product) => (
                        <TableRow 
                          key={product.productId}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: alpha('#2196f3', 0.04)
                            }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                                {product.lib.charAt(0)}
                              </Avatar>
                              <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
                                {product.lib}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={product.category}
                              size='small'
                              sx={{ 
                                bgcolor: alpha('#4caf50', 0.1),
                                color: '#4caf50'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
                                {product.quantity}
                              </Typography>
                              <Typography variant='caption' color='text.secondary' sx={{ ml: 0.5 }}>
                                {product.mesure}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
                              {product.price.toLocaleString('fr-FR')} F CFA
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2' sx={{ fontWeight: 'bold', color: 'success.main' }}>
                              {product.total.toLocaleString('fr-FR')} F CFA
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: alpha('#4caf50', 0.04), 
                  borderRadius: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant='subtitle1' color='text.secondary'>
                    Sous-total
                  </Typography>
                  <Typography variant='h5' sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    {order.totalAmount.toLocaleString('fr-FR')} F CFA
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default withAuth(OrderDetail);