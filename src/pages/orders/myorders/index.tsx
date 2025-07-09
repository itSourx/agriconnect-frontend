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
import Container from '@mui/material/Container'
import api from 'src/api/axiosConfig'
import { PDFDownloadLink } from '@react-pdf/renderer'
import FactureAdminPDF from '@/components/FactureAdminPDF'
import FactureBuyerPDF from '@/components/FactureBuyerPDF'
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
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { API_BASE_URL } from 'src/configs/constants'

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
    status: string;
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
    Photo?: Array<Array<{ url: string }>>;
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

// Fonction utilitaire pour formater les dates
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

// Fonction utilitaire pour formater les quantités
const formatQuantity = (quantity: number): string => {
  return quantity < 10 ? `0${quantity}` : quantity.toString()
}

// Composant pour l'affichage mobile des commandes
const MobileOrderCard = ({ order, statusTranslations, session, handleViewDetails }: {
  order: Order;
  statusTranslations: Record<string, { label: string; color: string }>;
  session: any;
  handleViewDetails: (id: string, orderNumber?: string) => void;
}) => {
  return (
    <Card
      sx={{
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          '& .view-details-icon': {
            opacity: 1,
            transform: 'translateX(0)'
          }
        },
        '&:after': {
          content: '""',
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 20,
          height: 20,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23666\'%3E%3Cpath d=\'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z\'/%3E%3C/svg%3E")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3,
          transition: 'opacity 0.2s ease'
        }
      }}
      onClick={() => handleViewDetails(order.id, order.fields.orderNumber)}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
            #{order.fields.orderNumber || 'N/A'}
          </Typography>
          <Chip
            label={statusTranslations[order.fields.status]?.label || order.fields.status}
            color={
              (statusTranslations[order.fields.status]?.color as 'warning' | 'success' | 'info' | 'error') ||
              'default'
            }
            size='small'
            variant='outlined'
          />
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {session?.user?.profileType === 'ACHETEUR' ? 'Agriculteur(s)' : 'Acheteur'}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {session?.user?.profileType === 'ACHETEUR' 
              ? (() => {
                  // Gérer les commandes avec plusieurs agriculteurs
                  const uniqueFarmers = new Set();
                  const farmerNames = [];
                  
                  for (let i = 0; i < (order.fields.farmerFirstName?.length || 0); i++) {
                    const firstName = order.fields.farmerFirstName?.[i] || '';
                    const lastName = order.fields.farmerLastName?.[i] || '';
                    const farmerKey = `${firstName} ${lastName}`;
                    
                    if (!uniqueFarmers.has(farmerKey)) {
                      uniqueFarmers.add(farmerKey);
                      farmerNames.push(farmerKey);
                    }
                  }
                  
                  if (farmerNames.length === 0) {
                    return 'Agriculteur inconnu';
                  } else if (farmerNames.length === 1) {
                    return farmerNames[0];
                  } else {
                    return `${farmerNames.length} agriculteur(s)`;
                  }
                })()
              : `${order.fields.buyerFirstName?.[0] || ''} ${order.fields.buyerLastName?.[0] || ''}`
            }
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Produit(s)
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {order.fields.productName?.length || 0} produit(s)
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Prix total
          </Typography>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            {order.fields.totalPrice?.toLocaleString('fr-FR')} F CFA
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {formatDate(order.createdTime)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="primary.main" sx={{ fontSize: '0.75rem' }}>
              Voir détails
          </Typography>
          <IconButton size="small" sx={{ color: 'primary.main' }}>
            <VisibilityIcon />
          </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
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
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

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
            '/orders',
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
          '/orders/byfarmer/' + userId,
          {
            headers: {
              accept: '*/*',
              Authorization: `bearer ${token}`,
            },
          }
        );
    
          const ordersList = (ordersResponse.data as any).data || [];
        console.log(ordersList)
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
                name: p.lib || 'Produit inconnu',
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
              Qty: order.products?.map((p: any) => formatQuantity(p.quantity || 1)).join('\n') || '',
              productName: order.products?.map((p: any) => p.lib) || [],
              LastModifiedDate: order.statusDate || order.createdDate,
              price: order.products?.map((p: any) => p.price || 0) || [],
              Nbr: order.totalProducts || 1,
              statusDate: order.statusDate || order.createdDate,
              buyerName: order.buyerName || [],
              category: order.products?.map((p: any) => p.category) || [],
              orderNumber: order.orderNumber
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
        '/orders/' + orderId,
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

  const handleViewDetails = (id: string, orderNumber?: string) => {
    // Pour les agriculteurs, mettre en cache les données de la commande avant de naviguer
    if (session?.user?.profileType === 'AGRICULTEUR') {
      const currentOrder = orders.find(order => order.id === id);
      if (currentOrder) {
        // Transformer les données pour correspondre au format attendu par la page de détails
        const orderForCache = [{
          farmerId: session.user.id,
          name: `${session.user.FirstName} ${session.user.LastName}`,
          email: session.user.email,
          compteOwo: (session.user as any).compteOwo || '',
          totalAmount: currentOrder.fields.totalPrice,
          totalProducts: currentOrder.fields.productName?.length || 0,
          buyerName: currentOrder.fields.buyerName || [],
          buyerEmail: currentOrder.fields.buyerEmail || [],
          products: currentOrder.fields.products?.map((product: any, index: number) => ({
            productId: product.productId || '',
            lib: product.name || '',
            category: currentOrder.fields.category?.[index] || 'Produit',
            mesure: product.unit || 'unité',
            price: product.price || 0,
            quantity: product.quantity || 0,
            total: product.total || 0,
            photo: currentOrder.fields.Photo?.[index]?.[0]?.url || product.photo || undefined
          })) || []
        }];
        
        // Mettre en cache
        sessionStorage.setItem(`order_${id}`, JSON.stringify(orderForCache));
      }
    }
    
    const queryParams = orderNumber ? `?orderNumber=${orderNumber}` : '';
    router.push(`/orders/myordersdetails/${id}${queryParams}`)
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
      const orderStatus = order.fields.status as keyof typeof stats
      if (orderStatus in stats) {
        stats[orderStatus]++
      }
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
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

              {/* Affichage conditionnel : Tableau pour desktop, Cartes pour mobile */}
              {isMobile ? (
                // Affichage mobile en cartes
                <Box>
                  {filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(order => (
                    <MobileOrderCard
                      key={order.id}
                      order={order}
                      statusTranslations={statusTranslations}
                      session={session}
                      handleViewDetails={handleViewDetails}
                    />
                  ))}
                  {filteredOrders.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        Aucune commande trouvée
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                // Affichage desktop en tableau
                <Box>
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
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(order => {
                      const productCount = order.fields.products?.length || 1

                      return (
                        <StyledTableRow 
                          key={order.id}
                              onClick={() => handleViewDetails(order.id, order.fields.orderNumber)}
                          sx={{ 
                            cursor: 'pointer',
                                position: 'relative',
                            '&:hover': {
                                  backgroundColor: 'action.hover',
                                  '& .view-details-icon': {
                                    opacity: 1,
                                    transform: 'translateX(0)'
                                  }
                                }
                          }}
                        >
                          <TableCell>{order.fields.orderNumber || '#'}</TableCell>
                          <TableCell>
                            {session?.user?.profileType === 'ACHETEUR' 
                                  ? (() => {
                                      // Gérer les commandes avec plusieurs agriculteurs
                                      const uniqueFarmers = new Set();
                                      const farmerNames = [];
                                      
                                      for (let i = 0; i < (order.fields.farmerFirstName?.length || 0); i++) {
                                        const firstName = order.fields.farmerFirstName?.[i] || '';
                                        const lastName = order.fields.farmerLastName?.[i] || '';
                                        const farmerKey = `${firstName} ${lastName}`;
                                        
                                        if (!uniqueFarmers.has(farmerKey)) {
                                          uniqueFarmers.add(farmerKey);
                                          farmerNames.push(farmerKey);
                                        }
                                      }
                                      
                                      if (farmerNames.length === 0) {
                                        return 'Agriculteur inconnu';
                                      } else if (farmerNames.length === 1) {
                                        return farmerNames[0];
                                      } else {
                                        return (
                                          <Tooltip 
                                            title={
                                              <Box sx={{ p: 1 }}>
                                                {farmerNames.map((name, index) => (
                                                  <Typography key={index} variant='body2'>
                                                    {name}
                                                  </Typography>
                                                ))}
                                              </Box>
                                            }
                                            arrow
                                          >
                                            <Typography variant='body2' sx={{ cursor: 'help' }}>
                                              {farmerNames.length} agriculteur(s)
                                            </Typography>
                                          </Tooltip>
                                        );
                                      }
                                    })()
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
                          <TableCell align="center">
                            <Tooltip title="Voir les détails" arrow>
                              <IconButton 
                                size="small" 
                                sx={{ 
                                  color: 'primary.main',
                                  '&:hover': {
                                    backgroundColor: 'primary.main',
                                    color: 'white'
                                  }
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </StyledTableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
                </Box>
              )}
              
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
    </Container>
  )
}

export default MyOrdersPage
