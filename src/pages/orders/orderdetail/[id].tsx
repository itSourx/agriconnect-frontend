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
  Button
} from '@mui/material';
import { toast } from 'react-hot-toast';

interface Order {
  farmerId: string;
  name: string;
  email: string;
  products: {
    productId: string;
    lib: string;
    category: string;
    mesure: string;
    price: number;
    quantity: number;
    total: number;
  }[];
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
        console.log('Token:', session?.accessToken);

        if (!session?.accessToken) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          router.push('/auth/login');
          return;
        }

        const response = await fetch(
          `https://agriconnect-bc17856a61b8.herokuapp.com/orders/details/${id}`,
          {
            headers: {
              'accept': '*/*',
              'Authorization': `bearer ${session.accessToken}`
            }
          }
        );

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Error response:', errorData);
          throw new Error('Erreur lors de la récupération des détails');
        }
        
        const data = await response.json();
        console.log('Order data:', data);
        setOrders(data);
      } catch (error) {
        console.error('Erreur complète:', error);
        toast.error('Erreur lors de la récupération des détails de la commande');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, session?.accessToken]);

  if (loading) return <Typography>Chargement...</Typography>;
  if (!orders.length) return <Typography>Commande non trouvée</Typography>;

  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalProducts = orders.reduce((sum, order) => sum + order.totalProducts, 0);

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant='h5'>Détails de la commande</Typography>
                <Button
                  variant='outlined'
                  onClick={() => router.push('/orders')}
                  startIcon={<i className='ri-arrow-left-line'></i>}
                >
                  Retour
                </Button>
              </Box>

              <Grid container spacing={4}>
                {/* Informations générales */}
                <Grid item xs={12} md={6}>
                  <Typography variant='h6' gutterBottom>Informations générales</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='body2' color='text.secondary'>Nombre total de produits</Typography>
                    <Typography>{totalProducts} produit(s)</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='body2' color='text.secondary'>Prix total</Typography>
                    <Typography>{totalAmount.toLocaleString('fr-FR')} F CFA</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Liste des agriculteurs et leurs produits */}
              {orders.map((order, index) => (
                <Box key={order.farmerId} sx={{ mb: 4 }}>
                  <Typography variant='h6' gutterBottom>
                    Agriculteur: {order.name}
                  </Typography>

                  <TableContainer sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Produit</TableCell>
                          {/* <TableCell>Catégorie</TableCell> */}
                          <TableCell>Quantité</TableCell>
                          <TableCell>Prix unitaire</TableCell>
                          <TableCell>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.products.map((product) => (
                          <TableRow key={product.productId}>
                            <TableCell>{product.lib}</TableCell>
                            {/* <TableCell>{product.category}</TableCell> */}
                            <TableCell>
                              {product.quantity} {product.mesure}
                            </TableCell>
                            <TableCell>{product.price.toLocaleString('fr-FR')} F CFA</TableCell>
                            <TableCell>{product.total.toLocaleString('fr-FR')} F CFA</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Typography variant='subtitle1'>
                      Sous-total: {order.totalAmount.toLocaleString('fr-FR')} F CFA
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderDetail;