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
  CircularProgress,
  Paper
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { withAuth } from '@/components/auth/withAuth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { alpha, styled } from '@mui/material/styles';
import { API_BASE_URL } from 'src/configs/constants';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FactureBuyerPDF from '@/components/FactureBuyerPDF';
import FactureFarmerPDF from '@/components/FactureFarmerPDF';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface OrderDetail {
  id: string;
  createdTime: string;
  fields: {
    id: string;
    status: string;
    totalPrice: number;
    totalPriceTaxed: number;
    tax: number;
    createdAt: string;
    products: string[];
    farmerProfile: string[];
    farmerLastName: string[];
    farmerFirstName: string[];
    farmerId: string[];
    farmerEmail: string[];
    buyer: string[];
    buyerLastName: string[];
    buyerFirstName: string[];
    profileBuyer: string[];
    buyerId: string[];
    buyerEmail: string[];
    Qty: string;
    productName: string[];
    LastModifiedDate: string;
    price: number[];
    Photo: Array<{ url: string }>[];
    Nbr: number;
    payStatus: string;
    farmerPayments: string;
    statusDate: string;
    buyerName: string[];
    mesure: string[];
    category: string[];
    orderNumber: string;
    farmerPayment: string;
    buyerPhone?: string[];
    buyerAddress?: string[];
    farmerOwoAccount?: string[];
  };
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': { 
    fontWeight: 'bold',
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderBottom: 'none'
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02)
  },
  '&:last-child td, &:last-child th': { border: 0 },
}));

const statusTranslations: Record<string, { label: string; color: 'warning' | 'success' | 'info' | 'error' | 'primary' | 'secondary' | 'default' }> = {
  pending: { label: 'En attente', color: 'warning' },
  confirmed: { label: 'Confirmée', color: 'success' },
  delivered: { label: 'Livrée', color: 'info' },
  completed: { label: 'Terminée', color: 'success' }
};

const OrderDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !session?.accessToken) return;

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/orders/${id}`,
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
        console.log('Data:', data);
        setOrderDetail(data);
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

  if (!orderDetail) {
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

  const { fields } = orderDetail;
  const quantities = fields.Qty.split(',').map(q => q.trim());

  // Fonction pour créer les données d'un agriculteur pour la facture
  const createFarmerData = (farmerName: string, farmerEmail: string, farmerProducts: any[]) => {
    const farmerId = fields.farmerId?.[farmerProducts[0]?.index] || '';
    const compteOwo = fields.farmerOwoAccount?.[farmerProducts[0]?.index] || 'Email inconnu';
    
    return {
      farmerId,
      name: farmerName,
      email: farmerEmail,
      compteOwo: compteOwo.toString(),
      totalAmount: farmerProducts.reduce((sum: number, p: any) => sum + p.total, 0),
      totalProducts: farmerProducts.length,
      products: farmerProducts.map((p: any) => {
        let photoUrl: string | undefined = undefined;
        const photoField = fields.Photo?.[p.index];
        if (photoField) {
          if (Array.isArray(photoField)) {
            photoUrl = photoField[0]?.url;
          } else if (typeof photoField === 'object' && 'url' in photoField) {
            photoUrl = (photoField as any).url;
          }
        }
        return {
          productId: fields.products?.[p.index] || `prod_${p.index}`,
          lib: p.name,
          category: p.category,
          mesure: p.mesure,
          price: p.price,
          quantity: p.quantity,
          total: p.total,
          photo: photoUrl
        };
      })
    };
  };

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => router.push('/orders')}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant='h5'>Détails de la commande #{fields.orderNumber}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Bouton de facture uniquement pour les acheteurs */}
              {!session?.user?.profileType?.includes('ADMIN') && !session?.user?.profileType?.includes('SUPERADMIN') && (
                <PDFDownloadLink
                  document={<FactureBuyerPDF order={orderDetail} />}
                  fileName={`facture_acheteur_${fields.orderNumber}.pdf`}
                >
                  {({ loading }) => (
                    <Button
                      variant="outlined"
                      startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Génération...' : 'Facture Acheteur'}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </Box>
          </Box>

          {/* Informations générales */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
                  <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: alpha('#2196f3', 0.04), 
                        borderRadius: 2,
                        height: '100%'
                      }}>
                    <Typography variant='body2' color='text.secondary' gutterBottom sx={{ fontWeight: 'bold' }}>
                      Statut
                    </Typography>
                    <Chip
                      label={statusTranslations[fields.status]?.label || fields.status}
                      color={statusTranslations[fields.status]?.color || 'default'}
                      size='small'
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: alpha('#ff9800', 0.04), 
                    borderRadius: 2,
                    height: '100%'
                  }}>
                    <Typography variant='body2' color='text.secondary' gutterBottom sx={{ fontWeight: 'bold' }}>
                      Nombre de produits
                    </Typography>
                    <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                      {fields.Nbr}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: alpha('#9c27b0', 0.04), 
                    borderRadius: 2,
                    height: '100%'
                  }}>
                    <Typography variant='body2' color='text.secondary' gutterBottom sx={{ fontWeight: 'bold' }}>
                      Date de création
                        </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                      {new Date(fields.createdAt).toLocaleDateString('fr-FR')}
                        </Typography>
                      </Box>
                    </Grid>
                {/* Statut de paiement */}
                <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: alpha('#4caf50', 0.04), 
                        borderRadius: 2,
                        height: '100%'
                      }}>
                    <Typography variant='body2' color='text.secondary' gutterBottom sx={{ fontWeight: 'bold' }}>
                      Statut de paiement
                        </Typography>
                    <Chip
                      label={fields.payStatus === 'PAID' ? 'Payée' : 'Non payée'}
                      color={fields.payStatus === 'PAID' ? 'success' : 'warning'}
                      size='small'
                      sx={{ mt: 1 }}
                    />
                      </Box>
                </Grid>
                {/* Infos acheteur */}
                <Grid item xs={12} md={12}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: alpha('#607d8b', 0.04), 
                    borderRadius: 2,
                    mt: 2
                  }}>
                    <Typography variant='body2' color='text.secondary' gutterBottom sx={{ fontWeight: 'bold' }}>
                      Client
                    </Typography>
                    <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 0.5, color: '#607d8b' }}>
                      {fields.buyerFirstName?.[0]} {fields.buyerLastName?.[0]}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Email : {fields.buyerEmail?.[0] || '-'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Téléphone : {fields.buyerPhone?.[0] || '-'}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                      Adresse : {fields.buyerAddress?.[0] || '-'}
                        </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tableau des produits */}
          <Card>
              <CardContent>
              <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                      <StyledTableCell>Photo</StyledTableCell>
                      <StyledTableCell>Produit</StyledTableCell>
                      <StyledTableCell>Catégorie</StyledTableCell>
                      <StyledTableCell>Quantité</StyledTableCell>
                      <StyledTableCell>Prix unitaire</StyledTableCell>
                      <StyledTableCell>Total</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                    {/* Grouper les produits par agriculteur */}
                    {(() => {
                      const farmerGroups = new Map();
                      
                      fields.productName?.forEach((productName, index) => {
                        const farmerKey = `${fields.farmerFirstName?.[index]} ${fields.farmerLastName?.[index]}`;
                        const farmerEmail = fields.farmerEmail?.[index];
                        
                        if (!farmerGroups.has(farmerKey)) {
                          farmerGroups.set(farmerKey, {
                            name: farmerKey,
                            email: farmerEmail,
                            products: []
                          });
                        }
                        
                        farmerGroups.get(farmerKey).products.push({
                          index,
                          name: productName,
                          category: fields.category?.[index],
                          quantity: quantities[index],
                          mesure: fields.mesure?.[index],
                          price: fields.price?.[index],
                          photo: fields.Photo?.[index]?.url,
                          total: fields.price?.[index] * parseInt(quantities[index])
                        });
                      });
                      
                      return Array.from(farmerGroups.values()).map((farmer, farmerIndex) => (
                        <React.Fragment key={farmer.name}>
                          {/* En-tête de l'agriculteur */}
                          <TableRow sx={{ backgroundColor: alpha('#f5f5f5', 0.5) }}>
                            <TableCell colSpan={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                    {farmer.name.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Box>
                                    <Typography variant='subtitle2' sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                      {farmer.name} 
                                    </Typography>
                                    <Typography variant='caption' color='text.secondary'>
                                      {farmer.products.length} produit(s) • Total: {farmer.products.reduce((sum: number, p: any) => sum + p.total, 0).toLocaleString('fr-FR')} F CFA
                                    </Typography>
                                  </Box>
                                </Box>
                                {/* Bouton de facture pour les admins */}
                                {(session?.user?.profileType?.includes('ADMIN') || session?.user?.profileType?.includes('SUPERADMIN')) && (
                                  <PDFDownloadLink
                                    document={<FactureFarmerPDF order={orderDetail} farmerData={createFarmerData(farmer.name, farmer.email, farmer.products)} />}
                                    fileName={`facture_${farmer.name.replace(/\s+/g, '_')}_${fields.orderNumber}.pdf`}
                                  >
                                    {({ loading }) => (
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={loading ? <CircularProgress size={16} /> : <FileDownloadIcon />}
                                        disabled={loading}
                                        sx={{ ml: 2 }}
                                      >
                                        {loading ? 'Génération...' : 'Facture'}
                                      </Button>
                                    )}
                                  </PDFDownloadLink>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                          
                          {/* Produits de l'agriculteur */}
                          {farmer.products.map((product: any, productIndex: number) => (
                            <StyledTableRow key={`${farmer.name}-${product.index}`}>
                          <TableCell>
                                {product.photo ? (
                                  <Avatar
                                    src={product.photo}
                                    sx={{
                                      width: 50,
                                      height: 50,
                                      objectFit: 'cover',
                                      border: '2px solid',
                                      borderColor: 'divider'
                                    }}
                                  />
                                ) : (
                              <Avatar
                                sx={{
                                      width: 50,
                                      height: 50,
                                      bgcolor: 'grey.300',
                                      color: 'grey.600'
                                    }}
                                  >
                                    <Typography variant="caption">No img</Typography>
                              </Avatar>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                  {product.name}
                              </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={product.category}
                              size='small'
                              sx={{ 
                                    bgcolor: alpha('#607d8b', 0.1),
                                    color: '#607d8b',
                                    fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                                {product.quantity}
                              </Typography>
                                  <Typography variant='body2' color='text.secondary'>
                                {product.mesure}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                                <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                                  {product.price?.toLocaleString('fr-FR')} F CFA
                            </Typography>
                          </TableCell>
                          <TableCell>
                                <Typography variant='body2' sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                              {product.total.toLocaleString('fr-FR')} F CFA
                            </Typography>
                          </TableCell>
                            </StyledTableRow>
                          ))}
                          
                          {/* Ligne de séparation entre agriculteurs */}
                          {farmerIndex < farmerGroups.size - 1 && (
                            <TableRow>
                              <TableCell colSpan={6} sx={{ height: 16, backgroundColor: alpha('#e0e0e0', 0.3) }} />
                        </TableRow>
                          )}
                        </React.Fragment>
                      ));
                    })()}
                    </TableBody>
                  </Table>
                </TableContainer>

              {/* Résumé */}
              <Box sx={{ 
                mt: 4, 
                p: 4, 
                bgcolor: 'background.paper',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
                  Résumé de la commande
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                <Box sx={{ 
                      p: 3, 
                      bgcolor: alpha('#607d8b', 0.08), 
                  borderRadius: 2,
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: alpha('#607d8b', 0.2)
                    }}>
                      <Typography variant='body2' color='text.secondary' gutterBottom sx={{ fontWeight: 'bold' }}>
                    Sous-total
                  </Typography>
                      <Typography variant='h5' sx={{ fontWeight: 'bold', color: '#607d8b' }}>
                        {fields.totalPrice.toLocaleString('fr-FR')} F CFA
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: alpha('#ff9800', 0.08), 
                      borderRadius: 2,
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: alpha('#ff9800', 0.2)
                    }}>
                      <Typography variant='body2' color='text.secondary' gutterBottom sx={{ fontWeight: 'bold' }}>
                        Taxe
                      </Typography>
                      <Typography variant='h5' sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                        {fields.tax?.toLocaleString('fr-FR')} F CFA
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: alpha('#2196f3', 0.08), 
                      borderRadius: 2,
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: alpha('#2196f3', 0.2)
                    }}>
                      <Typography variant='body2' color='text.secondary' gutterBottom sx={{ fontWeight: 'bold' }}>
                        Total avec taxe
                      </Typography>
                      <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                        {fields.totalPriceTaxed?.toLocaleString('fr-FR')} F CFA
                  </Typography>
                    </Box>
                  </Grid>
                </Grid>
                </Box>
              </CardContent>
            </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default withAuth(OrderDetail);