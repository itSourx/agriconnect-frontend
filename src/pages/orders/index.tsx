// pages/orders/index.tsx
import React, { useEffect, useState } from 'react'
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
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import { styled, alpha, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useRouter } from 'next/navigation'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { useNotifications } from '@/hooks/useNotifications'
import PaymentIcon from '@mui/icons-material/Payment'
import { useSession } from 'next-auth/react'
import { CircularProgress } from '@mui/material'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from 'src/configs/constants'
import SearchIcon from '@mui/icons-material/Search'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import SortIcon from '@mui/icons-material/Sort'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import Paper from '@mui/material/Paper'

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

interface Order {
  id: string
  createdTime: string
  fields: {
    status: string
    totalPrice: number
    Qty: string
    productName: string[]
    farmerFirstName: string[]
    farmerLastName: string[]
    buyerFirstName: string[]
    buyerLastName: string[]
    mesure: string[]
    price: number[]
    orderNumber: string
    Nbr?: number
    farmerId?: string[]
    Status?: string
    farmerPayment?: 'PENDING' | 'PAID'
  }
}

type StatusColor = 'warning' | 'success' | 'info' | 'error' | 'primary' | 'secondary' | 'default'

interface StatusTranslation {
  label: string
  color: StatusColor
}

const statusTranslations: Record<string, StatusTranslation> = {
  pending: { label: 'En attente', color: 'warning' },
  confirmed: { label: 'Confirmée', color: 'success' },
  delivered: { label: 'Livrée', color: 'info' },
  completed: { label: 'Terminée', color: 'success' }
}

const statusTransitions: Record<string, string | undefined> = {
  pending: 'confirmed',
  confirmed: 'delivered',
  delivered: 'completed',
  completed: undefined
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [farmerFilter, setFarmerFilter] = useState('')
  const [buyerFilter, setBuyerFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { notifyOrderDeleted, notifyError } = useNotifications()
  const { data: session } = useSession()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  
  // États pour le changement de statut
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false)
  const [orderToChangeStatus, setOrderToChangeStatus] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [processingStatusChange, setProcessingStatusChange] = useState(false)
  const [sortField, setSortField] = useState<'date' | 'products'>('date')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const theme = useTheme()

  useEffect(() => {
    if (session?.user?.profileType?.includes('SUPERADMIN') || session?.user?.profileType?.includes('ADMIN')) {
      setIsSuperAdmin(true)
    }
  }, [session])

  // Charger et trier les commandes
  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE_URL}/orders`, {
      headers: { accept: '*/*' }
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        // Trier par date (du plus récent au plus ancien)
        const sortedOrders = data.sort((a: Order, b: Order) =>
          new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
        )
        setOrders(sortedOrders)
        setFilteredOrders(sortedOrders)
      })
      .catch(error => console.error('Erreur lors de la récupération des commandes:', error))
      .finally(() => setLoading(false))
  }, [])

  // Filtrer les commandes
  useEffect(() => {
    let filtered = [...orders]

    if (farmerFilter) {
      filtered = filtered.filter(order => order.fields.farmerId?.[0] === farmerFilter)
    }
    if (buyerFilter) {
      filtered = filtered.filter(order => `${order.fields.buyerFirstName?.[0] || ''} ${order.fields.buyerLastName?.[0] || ''}`.trim() === buyerFilter)
    }
    if (statusFilter) {
      filtered = filtered.filter(order => order.fields.status === statusFilter)
    }
    if (searchQuery) {
      filtered = filtered.filter(
        order =>
          order.fields.farmerFirstName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.farmerLastName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.buyerFirstName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.buyerLastName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.productName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Tri
    filtered = filtered.sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.createdTime).getTime()
        const dateB = new Date(b.createdTime).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      } else if (sortField === 'products') {
        const nA = a.fields.Nbr || a.fields.productName?.length || 0
        const nB = b.fields.Nbr || b.fields.productName?.length || 0
        return sortOrder === 'desc' ? nB - nA : nA - nB
      }
      return 0
    })

    setFilteredOrders(filtered)
    setPage(0)
  }, [farmerFilter, buyerFilter, statusFilter, searchQuery, orders, sortField, sortOrder])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDelete = (id: string) => {
    const orderToDelete = orders.find(order => order.id === id)
    if (!orderToDelete) {
      notifyError('Commande non trouvée')
      return
    }

    fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: { accept: '*/*' }
    })
      .then(response => {
        if (response.ok) {
          setOrders(orders.filter(order => order.id !== id))
          setFilteredOrders(filteredOrders.filter(order => order.id !== id))
          notifyOrderDeleted(orderToDelete.fields.orderNumber || id)
        } else {
          notifyError('Erreur lors de la suppression de la commande')
        }
      })
      .catch(error => {
        console.error('Erreur lors de la suppression de la commande:', error)
        notifyError('Erreur lors de la suppression de la commande')
      })
  }

  const handleViewDetails = (id: string) => {
    router.push(`/orders/orderdetail/${id}`)
  }

  // Options uniques pour les filtres
  const farmers = Array.from(
    new Map(
      orders.map(o => [
        o.fields.farmerId?.[0],
        {
          id: o.fields.farmerId?.[0],
          firstName: o.fields.farmerFirstName?.[0],
          lastName: o.fields.farmerLastName?.[0]
        }
      ])
    ).values()
  ).filter(f => f.id)

  const buyers = [...new Set(orders.map(o => `${o.fields.buyerFirstName?.[0] || ''} ${o.fields.buyerLastName?.[0] || ''}`.trim()).filter(Boolean))]
  const statuses = ['pending', 'confirmed', 'delivered', 'completed']

  const handleDeleteClick = (id: string) => {
    setOrderToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (orderToDelete) {
      handleDelete(orderToDelete)
      setDeleteDialogOpen(false)
      setOrderToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setOrderToDelete(null)
  }

  const handlePayment = async (orderId: string) => {
    try {
      setProcessingPayment(orderId)
      const token = session?.accessToken
      if (!token) {
        toast.error('Session expirée, veuillez vous reconnecter')
        router.push('/auth/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/pay`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Authorization': `bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Paiement effectué avec succès')
        // Rafraîchir la liste des commandes
        const updatedOrders = await fetch(`${API_BASE_URL}/orders`, {
          headers: { accept: '*/*' }
        }).then(res => res.json())
        
        setOrders(updatedOrders)
        setFilteredOrders(updatedOrders)
      } else {
        throw new Error('Erreur lors du paiement')
      }
    } catch (err) {
      console.error('Erreur lors du paiement:', err)
      toast.error('Erreur lors du paiement de l\'agriculteur')
    } finally {
      setProcessingPayment(null)
    }
  }

  // Fonctions pour le changement de statut
  const handleStatusChangeClick = async (order: Order) => {
    const nextStatus = statusTransitions[order.fields.status];
    if (!nextStatus) return;
    try {
      setProcessingStatusChange(true);
      const token = session?.accessToken;
      if (!token) {
        toast.error('Session expirée, veuillez vous reconnecter');
        router.push('/auth/login');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Accept': '*/*',
          'Authorization': `bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (response.ok) {
        toast.success(`Statut changé vers ${statusTranslations[nextStatus as keyof typeof statusTranslations]?.label || nextStatus}`);
        // Mettre à jour l'état local
        const updatedOrders = orders.map(o =>
          o.id === order.id
            ? { ...o, fields: { ...o.fields, status: nextStatus } }
            : o
        );
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
      } else {
        // Essayer de lire le message du backend
        let errorMsg = 'Erreur lors du changement de statut';
        try {
          const data = await response.json();
          if (data?.message) errorMsg = data.message;
        } catch (e) {}
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
      // Essayer d'afficher le message du backend si dispo
      let errorMsg = 'Erreur lors du changement de statut';
      if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMsg = err.message;
      }
      toast.error(errorMsg);
    } finally {
      setProcessingStatusChange(false);
    }
  };

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4, mb: 3 }}
              >
                <Box>
                  <Typography variant='h5' mb={1} sx={{ fontWeight: 'bold' }}>
                    Liste des commandes
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Barre de filtres/tris homogène */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between" wrap="wrap">
              <Grid item xs={12} md={4} lg={4}>
                <TextField
                  placeholder='Rechercher (agriculteur, acheteur, produit)'
                  variant='outlined'
                  size='small'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={8} lg={8}>
                <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel id='farmer-select'>Agriculteur</InputLabel>
                      <Select
                        labelId='farmer-select'
                        value={farmerFilter}
                        onChange={e => setFarmerFilter(e.target.value)}
                        label='Agriculteur'
                        fullWidth
                      >
                        <MenuItem value=''>Tous</MenuItem>
                        {farmers.map(farmer => (
                          <MenuItem key={farmer.id} value={farmer.id}>
                            {`${farmer.firstName} ${farmer.lastName}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel id='buyer-select'>Acheteur</InputLabel>
                      <Select
                        labelId='buyer-select'
                        value={buyerFilter}
                        onChange={e => setBuyerFilter(e.target.value)}
                        label='Acheteur'
                        fullWidth
                      >
                        <MenuItem value=''>Tous</MenuItem>
                        {buyers.map(buyer => (
                          <MenuItem key={buyer} value={buyer}>
                            {buyer}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel id='status-select'>Statut</InputLabel>
                      <Select
                        labelId='status-select'
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        label='Statut'
                        fullWidth
                      >
                        <MenuItem value=''>Tous</MenuItem>
                        {statuses.map(status => (
                          <MenuItem key={status} value={status}>
                            {statusTranslations[status]?.label || status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3} sx={{ minWidth: 180 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      startIcon={<RestartAltIcon />}
                      fullWidth
                      onClick={() => {
                        setFarmerFilter('');
                        setBuyerFilter('');
                        setStatusFilter('');
                        setSortField('date');
                        setSortOrder('desc');
                        setSearchQuery('');
                      }}
                    >
                      Réinitialiser les filtres
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="center" justifyContent="flex-end" sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={2} lg={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id='sort-select'>Trier par</InputLabel>
                  <Select
                    labelId='sort-select'
                    value={sortField}
                    onChange={e => setSortField(e.target.value as 'date' | 'products')}
                    label='Trier par'
                    fullWidth
                  >
                    <MenuItem value='date'>Date</MenuItem>
                    <MenuItem value='products'>Nombre de produits</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2} lg={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id='order-select'>Ordre</InputLabel>
                  <Select
                    labelId='order-select'
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value as 'desc' | 'asc')}
                    label='Ordre'
                    fullWidth
                  >
                    <MenuItem value='desc'>Décroissant</MenuItem>
                    <MenuItem value='asc'>Croissant</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          <Divider sx={{ my: 3 }} />

          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <CardHeader />
                <CardContent>
                  <TableContainer sx={{ overflowX: 'auto', mt: 2 }}>
                    <Table aria-label='orders table'>
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>№</StyledTableCell>
                          <StyledTableCell>Agriculteur</StyledTableCell>
                          <StyledTableCell>Acheteur</StyledTableCell>
                          <StyledTableCell>Nombre de produits</StyledTableCell>
                          <StyledTableCell>Prix total (F CFA)</StyledTableCell>
                          <StyledTableCell>Statut</StyledTableCell>
                          <StyledTableCell>Date</StyledTableCell>
                          <StyledTableCell>Actions</StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(order => (
                          <StyledTableRow key={order.id}>
                            <TableCell>{order.fields.orderNumber}</TableCell>
                            <TableCell>
                              {order.fields.farmerFirstName?.[0]} {order.fields.farmerLastName?.[0]}
                            </TableCell>
                            <TableCell>
                              {order.fields.buyerFirstName?.[0]} {order.fields.buyerLastName?.[0]}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {order.fields.Nbr || order.fields.productName?.length || 0} produit(s)
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {order.fields.totalPrice?.toLocaleString('fr-FR')} F CFA
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={statusTranslations[order.fields.status]?.label || order.fields.status}
                                color={statusTranslations[order.fields.status]?.color || 'default'}
                                size='small'
                                variant='outlined'
                              />
                            </TableCell>
                            <TableCell>{new Date(order.createdTime).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton
                                  color='primary'
                                  size='small'
                                  onClick={() => handleViewDetails(order.id)}
                                >
                                  <VisibilityIcon style={{ fontSize: 18 }} />
                                </IconButton>
                                
                                <IconButton
                                  color='error'
                                  size='small'
                                  onClick={() => handleDeleteClick(order.id)}
                                >
                                  <DeleteIcon style={{ fontSize: 18 }} />
                                </IconButton>
                                {isSuperAdmin && order.fields.status !== 'completed' && statusTransitions[order.fields.status] && (() => {
                                  const nextStatus = statusTransitions[order.fields.status];
                                  return nextStatus ? (
                                    <Button
                                      color='info'
                                      size='small'
                                      variant='outlined'
                                      onClick={() => handleStatusChangeClick(order)}
                                      disabled={processingStatusChange}
                                      sx={{ minWidth: 120 }}
                                    >
                                      Passer à {statusTranslations[nextStatus as keyof typeof statusTranslations]?.label}
                                    </Button>
                                  ) : null;
                                })()}
                                {isSuperAdmin && order.fields.status === 'completed' && (
                                  <Button size='small' variant='outlined' disabled>Terminé</Button>
                                )}
                                {isSuperAdmin && order.fields.status === 'delivered' && (
                                  <IconButton
                                    color='success'
                                    size='small'
                                    onClick={() => handlePayment(order.id)}
                                    disabled={!!processingPayment}
                                  >
                                    {processingPayment === order.id ? (
                                      <CircularProgress size={20} />
                                    ) : (
                                      <PaymentIcon style={{ fontSize: 18 }} />
                                    )}
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    rowsPerPageOptions={[5, 10, 15, 25]}
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
            open={deleteDialogOpen}
            onClose={handleDeleteCancel}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description">
            <DialogTitle id="delete-dialog-title">
              Confirmer la suppression
            </DialogTitle>
            <DialogContent>
              <Typography>
                Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel}>Annuler</Button>
              <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                Supprimer
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  )
}

export default OrdersPage
