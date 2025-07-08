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
  useTheme
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
  }[]
  totalAmount: number
  totalProducts: number
  compteOwo: string
}

// Fonction utilitaire pour formater les quantités
const formatQuantity = (quantity: number): string => {
  return quantity < 10 ? `0${quantity}` : quantity.toString()
}

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
        console.log(data);
        // Vérifier si data est un tableau ou un objet unique
        const ordersData = Array.isArray(data) ? data : [data];
        
        // Pour les agriculteurs, filtrer pour ne garder que leurs produits
        if (session?.user?.profileType === 'AGRICULTEUR') {
          const currentFarmerId = session.user.id;
          const filteredOrders = ordersData.filter(order => order.farmerId === currentFarmerId);
          setOrders(filteredOrders);
          
          // Mettre en cache les données filtrées
          sessionStorage.setItem(`order_${id}`, JSON.stringify(filteredOrders));
        } else {
          setOrders(ordersData);
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
          'Prix unitaire (F CFA)': product.price.toLocaleString('fr-FR'),
          'Total Produit (F CFA)': product.total.toLocaleString('fr-FR'),
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
        unit: p.mesure
      })) || [],
      buyerFirstName: ['Client'],
      buyerLastName: ['AgriConnect'],
      buyerEmail: ['client@agriconnect.com'],
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
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
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
                    {loading ? 'Génération...' : 'Télécharger la facture'}
                  </Button>
                )}
              </PDFDownloadLink>
              <Button
                variant='outlined'
                color='primary'
                onClick={handleExport}
                startIcon={<DownloadIcon />}
              >
                Exporter en CSV
              </Button>
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
                          {subtotal.toLocaleString('fr-FR')} F CFA
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
                          {tax.toLocaleString('fr-FR')} F CFA
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
                          {totalTTC.toLocaleString('fr-FR')} F CFA
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
                              {product.price.toLocaleString('fr-FR')} F CFA
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant='body2' sx={{ fontWeight: 'bold', color: 'success.main' }}>
                              {product.total.toLocaleString('fr-FR')} F CFA
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                      <TableRow>
                      <TableCell colSpan={session?.user?.profileType === 'AGRICULTEUR' ? 4 : 5} align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant='subtitle1' color='text.secondary'>
                            Total de la commande
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                          {subtotal.toLocaleString('fr-FR')} F CFA
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                      <TableCell colSpan={session?.user?.profileType === 'AGRICULTEUR' ? 4 : 5} align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant='subtitle1' color='text.secondary'>
                            Taxes (18%)
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant='h6' sx={{ fontWeight: 'bold', color: 'error.main' }}>
                          {tax.toLocaleString('fr-FR')} F CFA
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                      <TableCell colSpan={session?.user?.profileType === 'AGRICULTEUR' ? 4 : 5} align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant='h6' sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            Prix total avec taxes
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant='h5' sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          {totalTTC.toLocaleString('fr-FR')} F CFA
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
    </Box>
  )
}

export default OrderDetailsPage
