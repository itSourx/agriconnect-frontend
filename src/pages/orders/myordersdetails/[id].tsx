import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  styled
} from '@mui/material'
import { PDFDownloadLink } from '@react-pdf/renderer'
import FacturePDF from '@/components/FacturePDF'
import { Order } from '@/types/order'
import * as XLSX from 'xlsx'
import api from 'src/api/axiosConfig'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DownloadIcon from '@mui/icons-material/Download'

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  background: theme.palette.background.paper
}))

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    fontWeight: 'bold',
    background: theme.palette.grey[100]
  }
}))

const OrderDetailsPage = () => {
  const router = useRouter()
  const { id } = router.query
  const { data: session, status } = useSession()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Traduction, progression et couleurs des statuts
  const statusTranslations: Record<string, { label: string; progress: number; color: string }> = {
    pending: { label: 'En attente', progress: 20, color: 'warning' },
    confirmed: { label: 'Confirmée', progress: 66, color: 'success' },
    delivered: { label: 'Livrée', progress: 100, color: 'info' }
  }

  const statusOrder = ['pending', 'confirmed', 'delivered']

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchOrderDetails = async () => {
      if (!id || !session?.accessToken) return

      try {
        setLoading(true)
        const response = await api.get(`https://agriconnect-bc17856a61b8.herokuapp.com/orders/${id}`, {
          headers: {
            accept: '*/*',
            Authorization: `bearer ${session.accessToken}`
          }
        })

        let data = response.data.data || response.data
        console.log('API Response:', data)

        // Parser farmerPayments (chaîne JSON)
        let farmerPayments = []
        try {
          farmerPayments = JSON.parse(data.fields.farmerPayments || '[]')
        } catch (e) {
          console.error('Erreur lors du parsing de farmerPayments:', e)
        }

        // Filtrer les produits pour le farmer connecté
        const currentFarmer = farmerPayments.find((payment: any) => payment.farmerId === session.user.id)
        const products = currentFarmer?.products || []

        const mappedOrder: Order = {
          id: data.id,
          createdTime: data.createdTime || new Date().toISOString(),
          fields: {
            Status: data.fields.status === 'completed' ? 'delivered' : data.fields.status || 'pending',
            totalPrice: currentFarmer?.totalAmount || data.fields.totalPrice || 0,
            productName: products.map((p: any) => p.lib),
            products: products.map((p: any) => ({
              productId: p.productId,
              name: p.lib,
              quantity: p.quantity,
              price: p.price || 0,
              total: p.total || p.quantity * p.price || 0,
              unit: p.mesure || 'unités'
            })),
            buyerFirstName: [data.fields.buyerFirstName?.[0] || 'Inconnu'],
            buyerLastName: [data.fields.buyerLastName?.[0] || ''],
            farmerId: [session.user.id || ''],
            farmerFirstName: [session.user.FirstName || currentFarmer?.name?.split(' ')[0] || ''],
            farmerLastName: [session.user.LastName || currentFarmer?.name?.split(' ').slice(1).join(' ') || ''],
            farmerEmail: [session.user.email || currentFarmer?.email || ''],
            farmerPhone: [session.user.Phone || ''],
            farmerAddress: [session.user.Address || '']
          }
        }

        setOrder(mappedOrder)
        console.log('Order currently displayed:', mappedOrder)
        setLoading(false)
      } catch (err: any) {
        console.error('Erreur lors du chargement de la commande:', err)
        setError(err.message || 'Erreur lors du chargement')
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [id, session, status, router])

  // Passer au statut suivant
  const handleNextStatus = async () => {
    if (!order || !session?.accessToken) return

    const currentStatus = order.fields.Status
    const currentIndex = statusOrder.indexOf(currentStatus)
    if (currentIndex === -1 || currentIndex === statusOrder.length - 1) return

    const nextStatus = statusOrder[currentIndex + 1] as 'pending' | 'confirmed' | 'delivered'

    try {
      await api.put(
        `https://agriconnect-bc17856a61b8.herokuapp.com/orders/${id}`,
        { fields: { Status: nextStatus } },
        {
          headers: {
            Authorization: `bearer ${session.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      setOrder({
        ...order,
        fields: { ...order.fields, Status: nextStatus }
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      setError('Erreur lors de la mise à jour du statut')
    }
  }

  // Exporter les détails en Excel
  const handleExport = () => {
    if (!order) return

    const exportData =
      order.fields.products?.map(product => ({
        'ID Commande': order.id,
        'Nom Acheteur': `${order.fields.buyerFirstName?.[0]} ${order.fields.buyerLastName?.[0]}`,
        'Email Acheteur': order.fields.buyerEmail?.[0] || 'N/A',
        'Téléphone Acheteur': order.fields.buyerPhone?.[0] || 'N/A',
        'Adresse Acheteur': order.fields.buyerAddress?.[0] || 'N/A',
        'Nom Vendeur': `${order.fields.farmerFirstName?.[0]} ${order.fields.farmerLastName?.[0]}`,
        Produit: product.name,
        Quantité: `${product.quantity} ${product.unit || 'unités'}`,
        'Prix Unitaire (F CFA)': product.price.toLocaleString('fr-FR'),
        'Total Produit (F CFA)': product.total.toLocaleString('fr-FR'),
        Statut: statusTranslations[order.fields.Status]?.label || order.fields.Status,
        'Date de création': new Date(order.createdTime).toLocaleString('fr-FR')
      })) || []

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

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => router.push('/orders/myorders')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
          Détails de la Commande #{id}
        </Typography>
      </Box>

      {order && (
        <Grid container spacing={6}>
          {/* Informations de l'acheteur */}
          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant='h6' gutterBottom sx={{ color: 'primary.main', fontSize: '1.25rem' }}>
                Informations de l'Acheteur
              </Typography>
              <Box sx={{ '& > p': { mb: 1 } }}>
                <Typography variant='body2'>
                  <strong>Nom :</strong> {order.fields.buyerFirstName?.[0] || 'Inconnu'}{' '}
                  {order.fields.buyerLastName?.[0] || ''}
                </Typography>
                <Typography variant='body2'>
                  <strong>Email :</strong> {order.fields.buyerEmail?.[0] || 'Non spécifié'}
                </Typography>
                <Typography variant='body2'>
                  <strong>Téléphone :</strong> {order.fields.buyerPhone?.[0] || 'Non spécifié'}
                </Typography>
                <Typography variant='body2'>
                  <strong>Adresse :</strong> {order.fields.buyerAddress?.[0] || 'Non spécifiée'}
                </Typography>
              </Box>
            </StyledPaper>
          </Grid>

          {/* Informations du vendeur */}
          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant='h6' gutterBottom sx={{ color: 'primary.main' }}>
                Informations du Vendeur
              </Typography>
              <Box sx={{ '& > p': { mb: 1 } }}>
                <Typography>
                  <strong>Nom :</strong> {order.fields.farmerFirstName?.[0] || 'Non spécifié'}{' '}
                  {order.fields.farmerLastName?.[0] || ''}
                </Typography>
                <Typography>
                  <strong>Email :</strong> {order.fields.farmerEmail?.[0] || 'Non spécifié'}
                </Typography>
                <Typography>
                  <strong>Téléphone :</strong> {order.fields.farmerPhone?.[0] || 'Non spécifié'}
                </Typography>
                <Typography>
                  <strong>Adresse :</strong> {order.fields.farmerAddress?.[0] || 'Non spécifiée'}
                </Typography>
              </Box>
            </StyledPaper>
          </Grid>

          {/* Liste des produits */}
          <Grid item xs={12}>
            <StyledPaper>
              <Typography variant='h6' gutterBottom sx={{ color: 'primary.main' }}>
                Produits Commandés
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Image</StyledTableCell>
                      <StyledTableCell>Produit</StyledTableCell>
                      <StyledTableCell>Quantité</StyledTableCell>
                      <StyledTableCell>Prix Unitaire</StyledTableCell>
                      <StyledTableCell>Total</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.fields.products?.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Avatar
                            src={product.image}
                            alt={product.name}
                            sx={{ width: 50, height: 50 }}
                          />
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          {product.quantity} {product.unit || 'unités'}
                        </TableCell>
                        <TableCell>{product.price.toLocaleString('fr-FR')} F CFA</TableCell>
                        <TableCell>{product.total.toLocaleString('fr-FR')} F CFA</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant='h6' sx={{ mt: 2, textAlign: 'right', fontSize: '1.25rem' }}>
                Total : {order.fields.totalPrice.toLocaleString('fr-FR')} F CFA
              </Typography>
            </StyledPaper>
          </Grid>

          {/* Statut de la commande */}
          <Grid item xs={12}>
            <StyledPaper>
              <Typography variant='h6' gutterBottom sx={{ color: 'primary.main' }}>
                Statut de la Commande
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant='determinate'
                    value={statusTranslations[order.fields.Status]?.progress || 0}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor:
                          order.fields.Status === 'pending'
                            ? 'warning.main'
                            : order.fields.Status === 'confirmed'
                            ? 'success.main'
                            : 'info.main'
                      }
                    }}
                  />
                  <Typography variant='body2' align='center' sx={{ mt: 1, fontWeight: 'medium' }}>
                    <Chip
                      label={statusTranslations[order.fields.Status]?.label || order.fields.Status}
                      color={statusTranslations[order.fields.Status]?.color as 'warning' | 'success' | 'info'}
                      size='small'
                    />
                  </Typography>
                </Box>
                {order.fields.Status !== 'delivered' && (
                  <Button variant='contained' color='primary' onClick={handleNextStatus} sx={{ minWidth: 120 }}>
                    Faire avancer
                  </Button>
                )}
              </Box>
            </StyledPaper>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <StyledPaper sx={{ p: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <PDFDownloadLink
                document={<FacturePDF order={order} />}
                fileName={`facture-${order.id}.pdf`}
                className='no-underline'
              >
                {({ loading }) => (
                  <Button
                    variant='contained'
                    color='primary'
                    disabled={loading}
                    startIcon={<DownloadIcon />}
                    size='small'
                    sx={{ px: 2 }}
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
                size='small'
                sx={{ px: 2 }}
              >
                Exporter en Excel
              </Button>
            </StyledPaper>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default OrderDetailsPage
