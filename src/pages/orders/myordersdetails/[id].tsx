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
  Divider
} from '@mui/material'
import { PDFDownloadLink } from '@react-pdf/renderer'
import FacturePDF from '@/components/FacturePDF'
import * as XLSX from 'xlsx'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DownloadIcon from '@mui/icons-material/Download'

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
}

const OrderDetailsPage = () => {
  const router = useRouter()
  const { id } = router.query
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !session?.accessToken) return

    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `https://agriconnect-bc17856a61b8.herokuapp.com/orders/details/${id}`,
          {
          headers: {
              'accept': '*/*',
              'Authorization': `bearer ${session.accessToken}`
          }
          }
        )

        if (response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.')
          router.push('/auth/login')
          return
        }

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des détails')
        }
        
        const data = await response.json()
        // Filtrer pour ne garder que la commande de l'agriculteur actuel
        const currentFarmerOrder = data.find((order: Order) => order.farmerId === session.user.id)
        if (currentFarmerOrder) {
          setOrders([currentFarmerOrder])
        } else {
          setOrders([])
        }
      } catch (error) {
        console.error('Erreur complète:', error)
        setError('Erreur lors de la récupération des détails de la commande')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [id, session?.accessToken, router, session?.user?.id])

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
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant='h6'>Chargement des détails...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    )
  } 

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color='error' variant='h6'>
          {error}
        </Typography>
        <Button
          variant='outlined'
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/orders/myorders')}
          sx={{ mt: 2 }}
        >
          Retour
        </Button>
      </Box>
    )
  }

  if (!orders.length) {
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
    )
  }

  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const totalProducts = orders.reduce((sum, order) => sum + order.totalProducts, 0)

  // Préparer les données pour FacturePDF
  const orderForPDF = {
    id: id as string,
    createdTime: new Date().toISOString(),
    fields: {
      Status: 'delivered' as const,
      totalPrice: totalAmount,
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

          <Card>
            <CardContent>
              <Grid container spacing={4}>
                {/* Informations générales */}
                <Grid item xs={12} md={6}>
                  <Typography variant='h6' gutterBottom sx={{ color: 'primary.main' }}>
                    Informations générales
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='body2' color='text.secondary'>Nombre total de produits</Typography>
                    <Typography variant='h6'>{totalProducts} produit(s)</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='body2' color='text.secondary'>Prix total</Typography>
                    <Typography variant='h6'>{totalAmount.toLocaleString('fr-FR')} F CFA</Typography>
                  </Box>
                </Grid>
          </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Liste des produits */}
              {orders[0] && (
                <Box>
                  <TableContainer sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Produit</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Quantité</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Prix unitaire</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders[0].products.map((product) => (
                          <TableRow key={product.productId}>
                            <TableCell>{product.lib}</TableCell>
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
                    <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                      Total: {orders[0].totalAmount.toLocaleString('fr-FR')} F CFA
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default OrderDetailsPage
