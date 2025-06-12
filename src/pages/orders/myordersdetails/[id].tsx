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
  CircularProgress
} from '@mui/material'
import { PDFDownloadLink } from '@react-pdf/renderer'
import FacturePDF from '@/components/FacturePDF'
import * as XLSX from 'xlsx'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DownloadIcon from '@mui/icons-material/Download'
import { alpha } from '@mui/material/styles'
import { toast } from 'react-hot-toast'

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

const OrderDetailsPage = () => {
  const router = useRouter()
  const { id } = router.query
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        // Vérifier si data est un tableau ou un objet unique
        setOrders(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Erreur complète:', error);
        toast.error('Erreur lors de la récupération des détails de la commande');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, session?.accessToken, router]);

  // Exporter les détails en Excel
  const handleExport = () => {
    if (!orders.length) return

    const exportData = orders.flatMap(order => 
      order.products.map(product => ({
        'ID Commande': id,
        'Nom Agriculteur': order.name,
        'Email Agriculteur': order.email,
        Produit: product.lib,
        Catégorie: product.category,
        Quantité: `${product.quantity} ${product.mesure}`,
        'Prix Unitaire (F CFA)': product.price.toLocaleString('fr-FR'),
        'Total Produit (F CFA)': product.total.toLocaleString('fr-FR'),
        'Date de création': new Date().toLocaleString('fr-FR')
      }))
    )

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Détails Commande')
    XLSX.writeFile(workbook, `commande_${id}_details.xlsx`)
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

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => router.push('/orders/myorders')}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant='h5'>Détails de la commande #{id}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <PDFDownloadLink
                document={<FacturePDF order={orderForPDF} />}
                fileName={`facture-${id}.pdf`}
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
                Exporter en Excel
              </Button>
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
                          {orders[0]?.totalProducts}
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
                          Prix total avec taxes
                        </Typography>
                        <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          {totalTTC.toLocaleString('fr-FR')} F CFA
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Informations du client */}
                <Grid item xs={12} md={6}>
                  <Typography variant='h6' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                    {session?.user?.profileType === 'ACHETEUR' ? 'Agriculteur' : 'Informations du client'}
                  </Typography>
                  <Box sx={{ 
                    p: 3, 
                    bgcolor: alpha('#ff9800', 0.04), 
                    borderRadius: 2,
                    height: '100%'
                  }}>
                    {session?.user?.profileType === 'ACHETEUR' ? (
                      <>
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
                            {orders[0]?.name?.charAt(0) || orders[0]?.fields?.farmerFirstName?.[0]?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                              {orders[0]?.name || (orders[0]?.fields?.farmerFirstName?.[0] + ' ' + orders[0]?.fields?.farmerLastName?.[0])}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {orders[0]?.email || orders[0]?.fields?.farmerEmail?.[0]}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            Compte OWO
                          </Typography>
                          <Typography variant='body1' sx={{ fontWeight: 'medium' }}>
                            {orders[0]?.compteOwo || orders[0]?.fields?.farmerId?.[0]}
                          </Typography>
                        </Box>
                      </>
                    ) : (
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
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Liste des produits */}
          {orders[0] && (
            <Card>
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
                      {orders[0].products.map((product) => (
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
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant='subtitle1' color='text.secondary'>
                            Total de la commande
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none' }}>
                          <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                            {orders[0].totalAmount.toLocaleString('fr-FR')} F CFA
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default OrderDetailsPage
