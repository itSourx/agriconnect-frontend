import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ShoppingCart as OrderIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { api } from 'src/configs/api';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  orderCount: number;
  lastOrderDate?: string;
  totalSpent: number;
}

const ClientsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchClients = async () => {
      try {
        setLoading(true);
        
        // Récupérer les commandes
        const ordersResponse = await api.get('/orders');
        
        // Filtrer les commandes de l'agriculteur
        const userOrders = ordersResponse.data.filter((o: any) => {
          if (Array.isArray(o.fields.farmerId)) {
            return o.fields.farmerId.includes(session.user.id);
          } else {
            return o.fields.farmerId === session.user.id;
          }
        });
        
        // Extraire les clients uniques
        const clientMap = new Map<string, Client>();
        
        userOrders.forEach((order: any) => {
          const userId = order.fields.userId?.[0];
          if (!userId) return;
          
          if (!clientMap.has(userId)) {
            clientMap.set(userId, {
              id: userId,
              name: order.fields.userName?.[0] || 'Client inconnu',
              email: order.fields.userEmail?.[0] || '',
              phone: order.fields.userPhone?.[0] || '',
              address: order.fields.userAddress?.[0] || '',
              orderCount: 0,
              totalSpent: 0
            });
          }
          
          const client = clientMap.get(userId)!;
          client.orderCount += 1;
          client.totalSpent += parseFloat(order.fields.totalAmount) || 0;
          
          // Mettre à jour la date de la dernière commande
          const orderDate = new Date(order.fields.createdAt);
          if (!client.lastOrderDate || new Date(client.lastOrderDate) < orderDate) {
            client.lastOrderDate = orderDate.toISOString();
          }
        });
        
        setClients(Array.from(clientMap.values()));
      } catch (err) {
        console.error('Erreur lors de la récupération des clients:', err);
        setError('Erreur lors du chargement des clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
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
        Mes Clients
      </Typography>
      
      <Card>
        <CardContent>
          {clients.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <Typography variant="h6" color="text.secondary">
                Vous n'avez pas encore de clients
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell align="right">Commandes</TableCell>
                    <TableCell align="right">Total dépensé</TableCell>
                    <TableCell align="right">Dernière commande</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {client.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body1">{client.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="column">
                          {client.email && (
                            <Box display="flex" alignItems="center" mb={0.5}>
                              <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">{client.email}</Typography>
                            </Box>
                          )}
                          {client.phone && (
                            <Box display="flex" alignItems="center" mb={0.5}>
                              <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">{client.phone}</Typography>
                            </Box>
                          )}
                          {client.address && (
                            <Box display="flex" alignItems="center">
                              <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">{client.address}</Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          icon={<OrderIcon />} 
                          label={client.orderCount} 
                          color="primary" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="bold">
                          {client.totalSpent.toFixed(2)} €
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {client.lastOrderDate ? (
                          <Typography variant="body2">
                            {new Date(client.lastOrderDate).toLocaleDateString()}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Voir les commandes">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => router.push(`/orders?clientId=${client.id}`)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientsPage; 