import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  LinearProgress,
  Divider,
  Avatar,
  CircularProgress,
  useTheme,
  Container
} from '@mui/material'
import { PDFDownloadLink } from '@react-pdf/renderer'
import FacturePDF from '@/components/FacturePDF'
import FactureBuyerPDF from '@/components/FactureBuyerPDF'
import { exportToCSV } from 'src/utils/csvExport'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DownloadIcon from '@mui/icons-material/Download'
import { alpha } from '@mui/material/styles'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from 'src/configs/constants'

interface Order {
  farmerId: string
  name: string
  email: string
  products: {
    productId: string
    lib: string
    category: string
    mesure: string
    price: number
    quantity: number
    total: number
    photo?: string
  }[]
  totalAmount: number
  totalProducts: number
  compteOwo: string
  buyerName?: string[]
  buyerEmail?: string[]
  buyerPhoto?: Array<{
    id: string
    width: number
    height: number
    url: string
    filename: string
    size: number
    type: string
    thumbnails: {
      small: {
        url: string
        width: number
        height: number
      }
      large: {
        url: string
        width: number
        height: number
      }
      full: {
        url: string
        width: number
        height: number
      }
    }
  }>
}

// Fonction utilitaire pour formater les quantités
const formatQuantity = (quantity: number): string => {
  return quantity < 10 ? `0${quantity}` : quantity.toString()
}

// Fonction pour formater les nombres avec des espaces normaux (pas d'Unicode)
const formatNumber = (num: number): string => {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const OrderDetailsPage = () => {
  const router = useRouter()
  const { id, orderNumber } = router.query
  const { data: session } = useSession()
  const theme = useTheme()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !session?.accessToken) return;

    const fetchOrderDetails = async () => {
      try {
        // Vérifier si on a des données en cache (depuis la page précédente)
        const cachedOrders = sessionStorage.getItem(`order_${id}`)
        
        if (cachedOrders && session?.user?.profileType === 'AGRICULTEUR') {
          // Utiliser les données en cache pour les agriculteurs
          const parsedOrders = JSON.parse(cachedOrders)
          setOrders(parsedOrders)
          setLoading(false)
          return
        }

        // Pour les agriculteurs, utiliser l'API byfarmer pour avoir les informations complètes
        if (session?.user?.profileType === 'AGRICULTEUR') {
          const response = await fetch(
            `${API_BASE_URL}/orders/byfarmer/${session.user.id}`,
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

          console.log('data.data');
          console.log(data.data);


          // Utiliser directement data.data au lieu de créer ordersList
          const targetOrder = data.data?.find((order: any) => order.orderId === id);
          console.log('targetOrder avec toutes les données:');
          console.log(targetOrder); 

          
          if (targetOrder) {
            // Transformer les données pour correspondre au format attendu
            const transformedOrder = {
              farmerId: session.user.id,
              name: `${session.user.FirstName} ${session.user.LastName}`,
              email: session.user.email,
              compteOwo: (session.user as any).compteOwo || '',
              totalAmount: targetOrder.totalAmount || 0,
              totalProducts: targetOrder.totalProducts || 0,
              buyerName: targetOrder.buyerName || [],
              buyerEmail: targetOrder.buyerEmail || [],
              buyerPhoto: targetOrder.buyerPhoto || [],
              products: targetOrder.products?.map((product: any) => {
                console.log('Product individuel:', product);
                console.log('Photo  du produit:', product.Photo);
                
                return {
                  productId: product.productId || '',
                  lib: product.lib || '',
                  category: product.category || 'Produit',
                  mesure: product.mesure || 'unité',
                  price: product.price || 0,
                  quantity: product.quantity || 0,
                  total: product.total || 0,
                  // Accès direct à la propriété Photo avec vérification
                  photo: product.Photo && product.Photo.length > 0 ? product.Photo[0].url : (product.photo || undefined)
                };
              }) || []
            };
            
            console.log('transformedOrder final:');
            console.log(transformedOrder);
            
            setOrders([transformedOrder]);
            
            // Mettre en cache les données
            sessionStorage.setItem(`order_${id}`, JSON.stringify([transformedOrder]));
          } else {
            setOrders([]);
          }
        } else {
          // Pour les acheteurs, utiliser l'API details
          const response = await fetch(
            `${API_BASE_URL}/orders/details/${id}`,
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
          console.log('data');
          console.log(data);
          // Vérifier si data est un tableau ou un objet unique
          const ordersData = Array.isArray(data) ? data : [data];

          // Transformer les données pour inclure les photos
          const transformedOrdersData = ordersData.map(order => ({
            ...order,
            buyerName: order.buyerName || [],
            buyerEmail: order.buyerEmail || [],
            buyerPhoto: order.buyerPhoto || [],
            products: order.products?.map((product: any) => ({
              ...product,
              photo: product.Photo?.[0]?.url || product.photo || undefined
            })) || []
          }));
          console.log('transformedOrdersData');
          console.log(transformedOrdersData);
          
          setOrders(transformedOrdersData);
        }
      } catch (error) {
        console.error('Erreur complète:', error);
        toast.error('Erreur lors de la récupération des détails de la commande');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, session?.accessToken, router, session?.user?.profileType, session?.user?.id]);

  // Nettoyer le cache quand on quitte la page
  useEffect(() => {
    return () => {
      if (id) {
        sessionStorage.removeItem(`order_${id}`);
      }
    };
  }, [id]);

  // Exporter les détails en CSV
  const handleExport = () => {
    const isFarmer = session?.user?.profileType === 'AGRICULTEUR'

    const exportData = orders.flatMap(order => 
      order.products.map(product => {
        const baseData = {
          'Produit': product.lib,
          'Catégorie': product.category,
          'Quantité': formatQuantity(product.quantity),
          'Prix unitaire (F CFA)': formatNumber(product.price),
          'Total Produit (F CFA)': formatNumber(product.total),
          'Date de création': new Date().toLocaleString('fr-FR')
        }
        
        // Ajouter la colonne Agriculteur seulement pour les acheteurs
        if (!isFarmer) {
          return {
            'Agriculteur': order.name,
            'Compte OWO': order.compteOwo || '-',
            ...baseData
          }
        }
        
        return baseData
      })
    )

    exportToCSV(exportData, `commande_${orderNumber || id}_details`)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  } 

  if (!orders || orders.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant='h6'>Commande non trouvée</Typography>
        <Button
          variant='outlined'
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/orders/myorders')}
          sx={{ mt: 2 }}
        >
          Retour
        </Button>
      </Box>
    );
  }

  const subtotal = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const totalTTC = subtotal + tax;


  // Préparer les données pour FacturePDF
  const orderForPDF = {
    id: id as string,
    createdTime: new Date().toISOString(),
    fields: {
      Status: 'delivered' as const,
      totalPrice: totalTTC,
      productName: orders[0]?.products.map(p => p.lib) || [],
      products: orders[0]?.products.map(p => ({
        productId: p.productId,
        name: p.lib,
        quantity: p.quantity,
        price: p.price,
        total: p.total,
        unit: p.mesure,
        photo: p.photo,
        reference: p.productId || 'N/A'
      })) || [],
      buyerFirstName: orders[0]?.buyerName?.[0]?.split(' ')[0] ? [orders[0].buyerName[0].split(' ')[0]] : ['Client'],
      buyerLastName: orders[0]?.buyerName?.[0]?.split(' ').slice(1).join(' ') ? [orders[0].buyerName[0].split(' ').slice(1).join(' ')] : ['AgriConnect'],
      buyerEmail: orders[0]?.buyerEmail?.[0] ? [orders[0].buyerEmail[0]] : ['client@agriconnect.com'],
      buyerPhone: [''],
      buyerAddress: [''],
      farmerId: [orders[0]?.farmerId || ''],
      farmerFirstName: [orders[0]?.name?.split(' ')[0] || ''],
      farmerLastName: [orders[0]?.name?.split(' ').slice(1).join(' ') || ''],
      farmerEmail: [orders[0]?.email || ''],
      farmerPhone: [''],
      farmerAddress: ['']
    }
  }

  // Préparer les données pour FactureBuyerPDF (structure différente)
  const orderForBuyerPDF = orders as any

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => router.push('/orders/myorders')}>
          <ArrowBackIcon />
        </IconButton>
              <Typography variant='h5'>Détails de la commande #{orderNumber || id}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
              {/* TODO: Réactiver le bouton Facture pour les acheteurs si nécessaire */}
              {/* Bouton Facture temporairement caché pour les acheteurs */}
              {session?.user?.profileType !== 'ACHETEUR' && (
                <PDFDownloadLink
                  document={session?.user?.profileType === 'ACHETEUR' ? 
                    <FactureBuyerPDF order={orderForBuyerPDF} /> : 
                    <FacturePDF order={orderForPDF} />
                  }
                  fileName={`facture-${orderNumber || id}.pdf`}
                  className='no-underline'
                >
                  {({ loading }) => (
                    <Button
                      variant='contained'
                      color='primary'
                      disabled={loading}
                      startIcon={<DownloadIcon />}
                    >
                      {loading ? 'Génération...' : 'Facture'}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
              {/* TODO: Réactiver le bouton Export CSV pour les acheteurs si nécessaire */}
              {/* Bouton Export CSV temporairement caché pour les acheteurs */}
              {session?.user?.profileType !== 'ACHETEUR' && (
                <Button
                  variant='outlined'
                  color='primary'
                  onClick={handleExport}
                  startIcon={<DownloadIcon />}
                >
                  Exporter en CSV
                </Button>
              )}
            </Box>
          </Box>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={4}>
                {/* Informations générales */}
                <Grid item xs={12}>
                  <Typography variant='h6' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                    Informations générales
                  </Typography>
                  
                  {/* Informations de l'acheteur */}
                  {session?.user?.profileType === 'AGRICULTEUR' && orders[0]?.buyerName && (
                    <Box sx={{ mb: 4, p: 3, bgcolor: alpha('#607d8b', 0.04), borderRadius: 2, border: '1px solid', borderColor: alpha('#607d8b', 0.2) }}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 'bold', color: '#607d8b', mb: 2 }}>
                        Informations de l'acheteur
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                        {orders[0]?.buyerPhoto?.[0] ? (
                          <Avatar
                            src={orders[0].buyerPhoto[0].url}
                            alt={orders[0]?.buyerName?.[0] || 'Acheteur'}
                            sx={{
                              width: 80,
                              height: 80,
                              border: '3px solid',
                              borderColor: alpha('#607d8b', 0.2)
                            }}
                          />
                        ) : (
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              bgcolor: alpha('#607d8b', 0.1),
                              color: '#607d8b',
                              fontSize: '2rem',
                              border: '3px solid',
                              borderColor: alpha('#607d8b', 0.2)
                            }}
                          >
                            {orders[0]?.buyerName?.[0]?.charAt(0) || 'A'}
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#607d8b', mb: 0.5 }}>
                            {orders[0]?.buyerName?.[0] || 'Non spécifié'}
                          </Typography>
                          <Typography variant='body1' sx={{ color: 'text.secondary' }}>
                            {orders[0]?.buyerEmail?.[0] || 'Non spécifié'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={2.4}>
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
                          {orders.reduce((sum, order) => sum + order.totalProducts, 0)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: alpha('#ff9800', 0.04), 
                        borderRadius: 2,
                        height: '100%'
                      }}>
                        <Typography variant='body2' color='text.secondary' gutterBottom>
                          Nombre d'agriculteurs
                        </Typography>
                        <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                          {orders.length}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: alpha('#9c27b0', 0.04), 
                        borderRadius: 2,
                        height: '100%'
                      }}>
                        <Typography variant='body2' color='text.secondary' gutterBottom>
                          Prix total HT
                        </Typography>
                        <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                          {formatNumber(subtotal)} F CFA
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: alpha(theme.palette.error.main, 0.04), 
                        borderRadius: 2,
                        height: '100%'
                      }}>
                        <Typography variant='body2' color='text.secondary' gutterBottom>
                          Taxes (18%)
                        </Typography>
                        <Typography variant='h4' sx={{ fontWeight: 'bold', color: 'error.main' }}>
                          {formatNumber(tax)} F CFA
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: alpha('#4caf50', 0.04), 
                        borderRadius: 2,
                        height: '100%'
                      }}>
                        <Typography variant='body2' color='text.secondary' gutterBottom>
                          Prix total avec taxes
                        </Typography>
                        <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          {formatNumber(totalTTC)} F CFA
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
          </Grid>
            </CardContent>
          </Card>

          {/* Liste complète des produits avec agriculteurs */}
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                {session?.user?.profileType === 'AGRICULTEUR' ? 'Détails des produits' : 'Détails des produits par agriculteur'}
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Photo</TableCell>
                      {session?.user?.profileType !== 'AGRICULTEUR' && (
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Agriculteur</TableCell>
                      )}
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Produit</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Catégorie</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Quantité</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }} align="right">Prix unitaire</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }} align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                    {orders.map((order, orderIndex) => 
                      order.products.map((product, productIndex) => (
                        <TableRow 
                          key={`${order.farmerId}-${product.productId}`}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: alpha('#2196f3', 0.04)
                            }
                          }}
                        >
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
                          {session?.user?.profileType !== 'AGRICULTEUR' && (
                            <TableCell>
                              {productIndex === 0 && (
                                <Box>
                                  <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
                                    {order.name}
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {order.email}
                                  </Typography>
                                </Box>
                              )}
                            </TableCell>
                          )}
                          <TableCell>
                            <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
                              {product.lib}
                            </Typography>
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
                                {formatQuantity(product.quantity)}
                              </Typography>
                              <Typography variant='caption' color='text.secondary' sx={{ ml: 0.5 }}>
                                {product.mesure}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
                              {formatNumber(product.price)} F CFA
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant='body2' sx={{ fontWeight: 'bold', color: 'success.main' }}>
                              {formatNumber(product.total)} F CFA
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                      <TableRow>
                      <TableCell colSpan={session?.user?.profileType === 'AGRICULTEUR' ? 5 : 6} align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant='subtitle1' color='text.secondary'>
                            Total de la commande
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                          {formatNumber(subtotal)} F CFA
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                      <TableCell colSpan={session?.user?.profileType === 'AGRICULTEUR' ? 5 : 6} align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant='subtitle1' color='text.secondary'>
                            Taxes (18%)
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant='h6' sx={{ fontWeight: 'bold', color: 'error.main' }}>
                          {formatNumber(tax)} F CFA
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                      <TableCell colSpan={session?.user?.profileType === 'AGRICULTEUR' ? 5 : 6} align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant='h6' sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            Prix total avec taxes
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant='h5' sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          {formatNumber(totalTTC)} F CFA
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default OrderDetailsPage
