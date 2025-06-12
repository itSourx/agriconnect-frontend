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
import { PDFDownloadLink } from '@react-pdf/renderer'
import FacturePDF from '@/components/FacturePDF'
import EmptyState from '@/components/EmptyState'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { toast } from 'react-hot-toast'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import PeopleIcon from '@mui/icons-material/People'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': { fontWeight: 'bold' }
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
  '&:last-child td, &:last-child th': { border: 0 }
}))

interface Order {
  id: string;
  createdTime: string;
  fields: {
    id: string;
    status: 'pending' | 'confirmed' | 'delivered' | 'completed';
    totalPrice: number;
    totalPricetaxed: number;
    createdAt: string;
    products: Array<{
      productId: string;
      name: string;
      quantity: number;
      price: number;
      total: number;
      unit?: string;
    }>;
    farmerProfile: string[];
    farmerLastName: string[];
    farmerFirstName: string[];
    farmerId: string[];
    farmerEmail: string[];
    buyer: string[];
    buyerAddress: string[];
    buyerPhone: string[];
    buyerLastName: string[];
    buyerFirstName: string[];
    profileBuyer: string[];
    buyerId: string[];
    buyerEmail: string[];
    Qty: string;
    productName: string[];
    LastModifiedDate: string;
    price: number[];
    Nbr: number;
    statusDate: string;
    buyerName: string[];
    category: string[];
    orderNumber: string;
  };
}

interface EmptyStateProps {
  title: string;
  image: string;
  buttonText: string;
  description?: string;
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: `${color}15`,
          color: color,
          mb: 2
        }}
      >
        {icon}
      </Box>
      <Typography variant='h4' sx={{ mb: 1, fontWeight: 'bold', color: 'text.primary' }}>
        {value}
      </Typography>
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
    </Paper>
  )
}

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [productFilter, setProductFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { data: session, status } = useSession()
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    orderId: '',
    currentStatus: '',
    nextStatus: ''
  })
  const [categoryFilter, setCategoryFilter] = useState('')

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

  const formatDate = (dateString: string) => {
    // Vérifier si la date est déjà au format souhaité (JJ/MM/AAAA HH:mm)
    if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(dateString)) {
      return dateString
    }
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
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
      const userType = session?.user?.profileType;
    
      if (!userId || !token) {
        router.push('/auth/login');
        return;
      }
    
      try {
        setIsLoading(true);
        let ordersResponse;

        if (userType === 'ACHETEUR') {
          // Pour les acheteurs, on récupère toutes les commandes et on filtre par l'ID de l'acheteur
          ordersResponse = await api.get(
            'https://agriconnect-bc17856a61b8.herokuapp.com/orders',
            {
              headers: {
                accept: '*/*',
                Authorization: `bearer ${token}`,
              },
            }
          );

          const allOrders = (ordersResponse as any).data || [];
          const buyerOrders = allOrders.filter((order: any) => order.fields.buyerId?.[0] === userId);

          const formattedOrders = buyerOrders.map((order: any) => ({
            id: order.id,
            createdTime: order.createdTime,
            fields: {
              ...order.fields,
              status: (order.fields.status === 'completed' ? 'delivered' : order.fields.status || 'pending') as 'pending' | 'confirmed' | 'delivered' | 'completed'
            }
          })) as Order[];

          // Trier les commandes par date de création (du plus récent au plus ancien)
          const sortedOrders = formattedOrders.sort((a, b) => 
            new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
          );

          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders);
        } else {
          // Pour les agriculteurs
          ordersResponse = await api.get(
          `https://agriconnect-bc17856a61b8.herokuapp.com/orders/byfarmer/${userId}`,
          {
            headers: {
              accept: '*/*',
              Authorization: `bearer ${token}`,
            },
          }
        );
    
          const ordersList = (ordersResponse.data as any).data || [];
    
          const farmerOrders = ordersList.map((order: any) => ({
            id: order.orderId,
            createdTime: order.createdDate,
            fields: {
              id: order.orderId,
              status: (order.status === 'completed' ? 'delivered' : order.status || 'pending') as 'pending' | 'confirmed' | 'delivered' | 'completed',
                totalPrice: order.totalAmount || 0,
              totalPricetaxed: order.totalAmount || 0,
              createdAt: order.createdDate,
              products: order.products?.map((p: any) => ({
                productId: p.id || '',
                name: p.name || 'Produit inconnu',
                quantity: p.quantity || 1,
                price: p.price || 0,
                total: (p.price || 0) * (p.quantity || 1),
                unit: p.unit || 'unité'
              })) || [],
              farmerProfile: [session?.user?.id || ''],
              farmerLastName: [session?.user?.LastName || ''],
              farmerFirstName: [session?.user?.FirstName || ''],
                farmerId: [session?.user?.id || ''],
                farmerEmail: [session?.user?.email || ''],
              buyer: order.buyerEmail || [],
              buyerAddress: [''],
              buyerPhone: [''],
              buyerLastName: order.buyerName?.map((name: string) => name.split(' ').slice(1).join(' ')) || [],
              buyerFirstName: order.buyerName?.map((name: string) => name.split(' ')[0]) || [],
              profileBuyer: [''],
              buyerId: [''],
              buyerEmail: order.buyerEmail || [],
              Qty: order.products?.map((p: any) => p.quantity || '1').join('\n') || '',
              productName: order.products?.map((p: any) => p.name) || [],
              LastModifiedDate: order.statusDate || order.createdDate,
              price: order.products?.map((p: any) => p.price || 0) || [],
              Nbr: order.totalProducts || 1,
              statusDate: order.statusDate || order.createdDate,
              buyerName: order.buyerName || [],
              category: order.products?.map((p: any) => p.category) || [],
              orderNumber: order.orderId
            }
          })) as Order[];

          // Trier les commandes par date de création (du plus récent au plus ancien)
          const sortedOrders = farmerOrders.sort((a, b) => 
            new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
          );
    
          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders);
        }
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
      filtered = filtered.filter(order => order.fields.status === statusFilter)
    }
    if (categoryFilter) {
      filtered = filtered.filter(order => 
        order.fields.category?.some(cat => cat === categoryFilter)
      )
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
  }, [productFilter, statusFilter, categoryFilter, searchQuery, orders])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleNextStatus = async (orderId: string, currentStatus: string, targetStatus?: string) => {
    const nextStatus = targetStatus || statusTransitions[currentStatus]?.[0]
    if (!nextStatus) return

    setConfirmDialog({
      open: true,
      orderId,
      currentStatus,
      nextStatus
    })
  }

  const handleConfirmStatusChange = async () => {
    const { orderId, nextStatus } = confirmDialog
    const token = session?.accessToken
    const toastId = toast.loading('Mise à jour du statut en cours...')

    try {
      await api.patch(
        `https://agriconnect-bc17856a61b8.herokuapp.com/orders/${orderId}`,
        { "status": nextStatus },
        {
          headers: {
            Authorization: `bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      setOrders(
        orders.map(order =>
          order.id === orderId ? { ...order, fields: { ...order.fields, status: nextStatus } } : order
        )
      )
      setFilteredOrders(
        filteredOrders.map(order =>
          order.id === orderId ? { ...order, fields: { ...order.fields, status: nextStatus } } : order
        )
      )

      toast.success('Statut mis à jour avec succès', { id: toastId })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      toast.error('Erreur lors de la mise à jour du statut', { id: toastId })
    } finally {
      setConfirmDialog({ open: false, orderId: '', currentStatus: '', nextStatus: '' })
    }
  }

  const handleViewDetails = (id: string) => {
    router.push(`/orders/myordersdetails/${id}`)
  }

  const products = [...new Set(orders.flatMap(o => o.fields.productName || []).filter(Boolean))].sort()
  const statuses = ['pending', 'confirmed', 'delivered']

  const getOrderStats = () => {
    const stats = {
      pending: 0,
      confirmed: 0,
      delivered: 0,
      completed: 0
    }

    orders.forEach(order => {
      stats[order.fields.status]++
    })

    return stats
  }

  const orderStats = getOrderStats()

  const categories = [...new Set(orders.flatMap(o => o.fields.category || []).filter(Boolean))].sort()

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
        image='/images/empty-orders.svg'
        buttonText='Explorer la marketplace'
        description="Vous n'avez pas encore de commandes"
      />
    )
  }

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}
          >
            <Box>
              <Typography variant='h5' mb={1} sx={{ fontWeight: 'bold' }}>
                Mes Commandes
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title='Commandes en attente'
                value={orderStats.pending}
                icon={<ShoppingCartIcon sx={{ fontSize: 20 }} />}
                color='#ff9800'
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title='Commandes confirmées'
                value={orderStats.confirmed}
                icon={<ShoppingCartIcon sx={{ fontSize: 20 }} />}
                color='#4caf50'
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title='Commandes livrées'
                value={orderStats.delivered}
                icon={<ShoppingCartIcon sx={{ fontSize: 20 }} />}
                color='#2196f3'
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title='Commandes terminées'
                value={orderStats.completed}
                icon={<ShoppingCartIcon sx={{ fontSize: 20 }} />}
                color='#9c27b0'
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FormControl sx={{ minWidth: 200, maxWidth: 300 }}>
                      <InputLabel id='product-select'>Produit</InputLabel>
                      <Select
                        labelId='product-select'
                        value={productFilter}
                        onChange={e => setProductFilter(e.target.value)}
                        input={<OutlinedInput label='Produit' />}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        <MenuItem value=''>Tous les produits</MenuItem>
                        {products.map(product => (
                          <MenuItem key={product} value={product}>
                            {product}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 200, maxWidth: 300 }}>
                      <InputLabel id='category-select'>Catégorie</InputLabel>
                      <Select
                        labelId='category-select'
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        input={<OutlinedInput label='Catégorie' />}
                      >
                        <MenuItem value=''>Toutes les catégories</MenuItem>
                        {categories.map(category => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 200, maxWidth: 300 }}>
                      <InputLabel id='status-select'>Statut</InputLabel>
                      <Select
                        labelId='status-select'
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        input={<OutlinedInput label='Statut' />}
                      >
                        <MenuItem value=''>Tous les statuts</MenuItem>
                        {statuses.map(status => (
                          <MenuItem key={status} value={status}>
                            {statusTranslations[status]?.label || status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      placeholder='Rechercher (acheteur, produit)'
                      variant='outlined'
                      size='small'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      sx={{ minWidth: 250, maxWidth: 300 }}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table aria-label='orders table'>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>N° Commande</StyledTableCell>
                      <StyledTableCell>{session?.user?.profileType === 'ACHETEUR' ? 'Agriculteur' : 'Acheteur'}</StyledTableCell>
                      <StyledTableCell>Produit(s)</StyledTableCell>
                      <StyledTableCell>Prix total (F CFA)</StyledTableCell>
                      <StyledTableCell>Statut</StyledTableCell>
                      <StyledTableCell>Date</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(order => {
                      const productCount = order.fields.products?.length || 1

                      return (
                        <StyledTableRow 
                          key={order.id}
                          onClick={() => handleViewDetails(order.id)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <TableCell>{order.fields.orderNumber || '#'}</TableCell>
                          <TableCell>
                            {session?.user?.profileType === 'ACHETEUR' 
                              ? `${order.fields.farmerFirstName?.[0] || ''} ${order.fields.farmerLastName?.[0] || ''}`
                              : `${order.fields.buyerFirstName?.[0] || ''} ${order.fields.buyerLastName?.[0] || ''}`
                            }
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
                                  {order.fields.productName?.map((name, index) => (
                                    <Typography key={index} variant='body2' sx={{ whiteSpace: 'nowrap' }}>
                                      {name}
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
                                {order.fields.productName?.length || 0} produit(s)
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{order.fields.totalPrice?.toLocaleString('fr-FR')}</TableCell>
                          <TableCell>
                            <Chip
                              label={statusTranslations[order.fields.status]?.label || order.fields.status}
                              color={
                                (statusTranslations[order.fields.status]?.color as 'warning' | 'success' | 'info' | 'error') ||
                                'default'
                              }
                              size='small'
                              variant='outlined'
                            />
                          </TableCell>
                          <TableCell>{formatDate(order.createdTime)}</TableCell>
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

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, orderId: '', currentStatus: '', nextStatus: '' })}
      >
        <DialogTitle>Confirmer le changement de statut</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir passer cette commande du statut "{statusTranslations[confirmDialog.currentStatus]?.label}" à "{statusTranslations[confirmDialog.nextStatus]?.label}" ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ open: false, orderId: '', currentStatus: '', nextStatus: '' })}
            color="inherit"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmStatusChange} 
            color="primary" 
            variant="contained"
            autoFocus
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MyOrdersPage
