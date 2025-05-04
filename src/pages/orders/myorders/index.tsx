import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import OutlinedInput from '@mui/material/OutlinedInput'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DownloadIcon from '@mui/icons-material/Download'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import api from 'src/api/axiosConfig'
import { Order, User, Session } from '@/types/order'
import { PDFDownloadLink } from '@react-pdf/renderer'
import FacturePDF from '@/components/FacturePDF'
import EmptyState from '@/components/EmptyState'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': { fontWeight: 'bold' }
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
  '&:last-child td, &:last-child th': { border: 0 }
}))

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [productFilter, setProductFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { data: session, status } = useSession()

  const statusTranslations: Record<string, { label: string; color: string }> = {
    pending: { label: 'En attente', color: 'warning' },
    confirmed: { label: 'Confirmée', color: 'success' },
    delivered: { label: 'Livrée', color: 'info' },
    completed: { label: 'Terminée', color: 'success' }
  }

  const statusOrder = ['pending', 'confirmed', 'delivered', 'completed']

  const statusTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'completed'],
    confirmed: ['delivered', 'completed'],
    delivered: ['completed']
  }

  // Obtenir le texte du bouton en fonction du statut suivant
  const getNextStatusButtonText = (currentStatus: string) => {
    const nextStatus = statusTransitions[currentStatus]?.[0]
    if (!nextStatus) return ''

    const nextStatusLabel = statusTranslations[nextStatus]?.label || nextStatus
    return `Passer à ${nextStatusLabel}`
  }

  // Vérifier si on peut passer directement à "Terminé"
  const canCompleteOrder = (currentStatus: string) => {
    return currentStatus !== 'completed'
  }

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchOrders = async () => {
      const userId = session?.user?.id;
      const token = session?.accessToken;
    
      if (!userId || !token) {
        router.push('/auth/login');
        return;
      }
    
      try {
        setIsLoading(true);
        const ordersResponse = await api.get(
          `https://agriconnect-bc17856a61b8.herokuapp.com/orders/byfarmer/${userId}`,
          {
            headers: {
              accept: '*/*',
              Authorization: `bearer ${token}`,
            },
          }
        );
    
        console.log('Réponse /orders/byfarmer:', ordersResponse.data);
    
        const ordersList = ordersResponse.data.data || [];
    
        const farmerOrders = ordersList
          .map((order: any) => {
            // Extraire le nom et prénom de l'acheteur
            const buyerName = order.buyer?.[0] || 'Inconnu';
            const buyerNameParts = buyerName.split(' ');
            const buyerFirstName = buyerNameParts[0] || 'Inconnu';
            const buyerLastName = buyerNameParts.slice(1).join(' ') || '';
    
            // Formater les produits
            const products = order.products?.map((p: any) => ({
              productId: p.productId || '',
              name: p.lib || 'Produit inconnu',
              quantity: p.quantity || 0,
              price: p.price || 0,
              total: p.total || p.quantity * p.price || 0,
              unit: p.mesure || 'unités',
            })) || [];
    
            return {
              id: order.orderId,
              createdTime: order.createdDate || new Date().toISOString(),
              fields: {
                Status: order.status === 'completed' ? 'delivered' : order.status || 'pending',
                totalPrice: order.totalAmount || 0,
                productName: products.map((p: any) => p.name),
                products: products,
                buyerFirstName: [buyerFirstName],
                buyerLastName: [buyerLastName],
                buyerEmail: [''],
                buyerPhone: [''],
                buyerAddress: [''],
                farmerId: [session?.user?.id || ''],
                farmerFirstName: [session?.user?.FirstName || ''],
                farmerLastName: [session?.user?.LastName || ''],
                farmerEmail: [session?.user?.email || ''],
                farmerPhone: [session?.user?.Phone || ''],
                farmerAddress: [session?.user?.Address || ''],
                productImage: products.map((p: any) => '/images/placeholder.png'),
              },
            };
          })
          .sort((a: Order, b: Order) => {
            const statusOrder = ['pending', 'confirmed', 'delivered', 'completed'];
            const aIndex = statusOrder.indexOf(a.fields.Status);
            const bIndex = statusOrder.indexOf(b.fields.Status);
            
            if (aIndex === bIndex) {
              return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
            }
            return aIndex - bIndex;
          });
    
        console.log('Farmer Orders:', farmerOrders);
        setOrders(farmerOrders);
        setFilteredOrders(farmerOrders);
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders()
  }, [router, session, status])

  useEffect(() => {
    let filtered = [...orders]

    if (productFilter) {
      filtered = filtered.filter(order => order.fields.productName?.includes(productFilter))
    }
    if (statusFilter) {
      filtered = filtered.filter(order => order.fields.Status === statusFilter)
    }
    if (searchQuery) {
      filtered = filtered.filter(
        order =>
          order.fields.buyerFirstName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.buyerLastName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.productName?.some((name: string) => name?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredOrders(filtered)
    setPage(0)
  }, [productFilter, statusFilter, searchQuery, orders])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleNextStatus = async (orderId: string, currentStatus: string, targetStatus?: string) => {
    const nextStatus = targetStatus || statusTransitions[currentStatus]?.[0]
    if (!nextStatus) return

    const token = (session as Session)?.accessToken

    try {
      await api.put(
        `https://agriconnect-bc17856a61b8.herokuapp.com/orders/${orderId}`,
        { status: nextStatus },
        {
          headers: {
            Authorization: `bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      setOrders(
        orders.map(order =>
          order.id === orderId ? { ...order, fields: { ...order.fields, Status: nextStatus } } : order
        )
      )
      setFilteredOrders(
        filteredOrders.map(order =>
          order.id === orderId ? { ...order, fields: { ...order.fields, Status: nextStatus } } : order
        )
      )
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  const handleViewDetails = (id: string) => {
    router.push(`/orders/myordersdetails/${id}`)
  }

  const products = [...new Set(orders.flatMap(o => o.fields.productName || []).filter(Boolean))]
  const statuses = ['pending', 'confirmed', 'delivered']

  if (status === 'loading' || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title='Aucune commande'
        description="Vous n'avez pas encore passé de commande. Explorez notre marketplace pour découvrir des produits locaux de qualité"
        image='/images/empty-orders.svg'
        buttonText='Explorer la marketplace'
        buttonLink='/marketplace'
      />
    )
  }

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Mes Commandes' />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id='product-select'>Produit</InputLabel>
                    <Select
                      labelId='product-select'
                      value={productFilter}
                      onChange={e => setProductFilter(e.target.value)}
                      input={<OutlinedInput label='Produit' />}
                    >
                      <MenuItem value=''>Tous</MenuItem>
                      {products.map(product => (
                        <MenuItem key={product} value={product}>
                          {product}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id='status-select'>Statut</InputLabel>
                    <Select
                      labelId='status-select'
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      input={<OutlinedInput label='Statut' />}
                    >
                      <MenuItem value=''>Tous</MenuItem>
                      {statuses.map(status => (
                        <MenuItem key={status} value={status}>
                          {statusTranslations[status]?.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 4,
                  flexWrap: { xs: 'wrap', sm: 'nowrap' }
                }}
              >
                <TextField
                  placeholder='Rechercher (acheteur, produit)'
                  variant='outlined'
                  size='small'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  sx={{ maxWidth: { sm: '300px' }, width: '100%' }}
                />
              </Box>
              <TableContainer sx={{ overflowX: 'auto', mt: 2 }}>
                <Table aria-label='orders table'>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Acheteur</StyledTableCell>
                      <StyledTableCell>Produit(s)</StyledTableCell>
                      <StyledTableCell>Prix total (F CFA)</StyledTableCell>
                      <StyledTableCell>Statut</StyledTableCell>
                      <StyledTableCell>Date</StyledTableCell>
                      <StyledTableCell>Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(order => {
                      const productCount = order.fields.products?.length || 1

                      return (
                        <StyledTableRow key={order.id}>
                          <TableCell>
                            {order.fields.buyerFirstName?.[0]} {order.fields.buyerLastName?.[0]}
                          </TableCell>
                          <TableCell>
                            <Tooltip 
                              title={
                                <Box sx={{ 
                                  p: 1,
                                  backgroundColor: 'white',
                                  color: 'text.primary',
                                  boxShadow: 1,
                                  borderRadius: 1
                                }}>
                                  {order.fields.products?.map((product, index) => (
                                    <Typography key={index} variant='body2' sx={{ whiteSpace: 'nowrap' }}>
                                      {product.name} - {product.quantity} {product.unit}
                                    </Typography>
                                  ))}
                                </Box>
                              }
                              arrow
                              componentsProps={{
                                tooltip: {
                                  sx: {
                                    bgcolor: 'white',
                                    '& .MuiTooltip-arrow': {
                                      color: 'white',
                                    }
                                  }
                                }
                              }}
                            >
                              <Typography variant='body2' sx={{ cursor: 'help' }}>
                                {order.fields.products?.length || 0} produit(s)
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{order.fields.totalPrice?.toLocaleString('fr-FR')}</TableCell>
                          <TableCell>
                            <Chip
                              label={statusTranslations[order.fields.Status]?.label || order.fields.Status}
                              color={
                                (statusTranslations[order.fields.Status]?.color as 'warning' | 'success' | 'info') ||
                                'default'
                              }
                              size='small'
                              variant='outlined'
                            />
                          </TableCell>
                          <TableCell>{order.createdTime}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
                              <IconButton
                                color='primary'
                                onClick={() => handleViewDetails(order.id)}
                                title='Voir les détails'
                                size='small'
                              >
                                <VisibilityIcon />
                              </IconButton>
                              <PDFDownloadLink
                                document={<FacturePDF order={order} />}
                                fileName={`facture-${order.id}.pdf`}
                                className='no-underline'
                              >
                                {({ loading }) => (
                                  <IconButton
                                    sx={{ color: 'grey.600' }}
                                    disabled={loading}
                                    title='Télécharger la facture'
                                    size='small'
                                  >
                                    <DownloadIcon />
                                  </IconButton>
                                )}
                              </PDFDownloadLink>
                              {order.fields.Status !== 'completed' && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    variant='contained'
                                    size='small'
                                    color='primary'
                                    onClick={() => handleNextStatus(order.id, order.fields.Status)}
                                    sx={{ minWidth: 'auto', px: 2 }}
                                  >
                                    {getNextStatusButtonText(order.fields.Status)}
                                  </Button>
                                  {canCompleteOrder(order.fields.Status) && (
                                    <Button
                                      variant='contained'
                                      size='small'
                                      color='success'
                                      onClick={() => handleNextStatus(order.id, order.fields.Status, 'completed')}
                                      sx={{ minWidth: 'auto', px: 2 }}
                                    >
                                      Fermer
                                    </Button>
                                  )}
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                        </StyledTableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component='div'
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default MyOrdersPage
