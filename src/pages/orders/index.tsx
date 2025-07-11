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
import { useSession } from 'next-auth/react'
import { CircularProgress } from '@mui/material'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from 'src/configs/constants'
import SearchIcon from '@mui/icons-material/Search'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import SortIcon from '@mui/icons-material/Sort'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import Paper from '@mui/material/Paper'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'

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

// Ajout des traductions pour les verbes à l'infinitif
const statusActionTranslations: Record<string, string> = {
  confirmed: 'Confirmer',
  delivered: 'Livrer',
  completed: 'Terminer'
}

const statusTransitions: Record<string, string | undefined> = {
  pending: 'confirmed',
  confirmed: 'delivered',
  delivered: 'completed',
  completed: undefined
};

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
  const { data: session, status } = useSession()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  
  // États pour le changement de statut
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false)
  const [orderToChangeStatus, setOrderToChangeStatus] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [processingStatusChange, setProcessingStatusChange] = useState(false)
  const [sortField, setSortField] = useState<'date' | 'products'>('date')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const theme = useTheme()

  // Fonction pour calculer les statistiques des commandes
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

  // Guard de navigation - Empêcher l'accès aux profils non-admin
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    // Vérifier si l'utilisateur a les permissions d'admin
    const isAdmin = session?.user?.profileType === 'ADMIN' || session?.user?.profileType === 'SUPERADMIN'
    
    if (!isAdmin) {
      // Rediriger vers la page appropriée selon le profil
      if (session?.user?.profileType === 'AGRICULTEUR') {
        router.push('/orders/myorders')
      } else if (session?.user?.profileType === 'ACHETEUR') {
        router.push('/orders/myorders')
      } else {
        router.push('/dashboard')
      }
      return
    }
  }, [session, status, router])

  // Afficher un écran de chargement pendant la vérification des permissions
  if (status === 'loading' || !session?.user?.profileType || 
      (session?.user?.profileType !== 'ADMIN' && session?.user?.profileType !== 'SUPERADMIN')) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

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

      {/* Cadrans de statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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

          {/* Nouvelle section de filtres/tris moderne */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              bgcolor: 'transparent',
              borderRadius: 0,
            }}
          >
            <Box>
              {/* En-tête des filtres */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FilterAltIcon sx={{ color: 'primary.main', mr: 1, fontSize: 24 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'text.primary', 
                    fontWeight: 600,
                    flex: 1
                  }}
                >
                  Filtres et recherche
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RestartAltIcon />}
                  onClick={() => {
                    setFarmerFilter('');
                    setBuyerFilter('');
                    setStatusFilter('');
                    setSortField('date');
                    setSortOrder('desc');
                    setSearchQuery('');
                  }}
                  sx={{
                    borderColor: 'divider',
                    color: 'text.secondary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                    }
                  }}
                >
                  Réinitialiser
                </Button>
              </Box>

              {/* Barre de recherche principale */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  placeholder="Rechercher par agriculteur, acheteur ou produit..."
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    sx: {
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid',
                        borderColor: 'divider',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                        borderWidth: '2px',
                      },
                    }
                  }}
                />
              </Box>

              {/* Filtres et tri */}
              <Grid container spacing={2} alignItems="center">
                {/* Filtres */}
        <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Agriculteur</InputLabel>
                    <Select
                      value={farmerFilter}
                          onChange={(e) => setFarmerFilter(e.target.value)}
                          label="Agriculteur"
                          sx={{
                            bgcolor: 'background.default',
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid',
                              borderColor: 'divider',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                              borderWidth: '2px',
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                mt: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                '& .MuiMenuItem-root': {
                                  borderRadius: 0.5,
                                  mx: 0.5,
                                  my: 0.25,
                                }
                              }
                            }
                          }}
                    >
                          <MenuItem value="">Tous les agriculteurs</MenuItem>
                      {farmers.map(farmer => (
                        <MenuItem key={farmer.id} value={farmer.id}>
                          {`${farmer.firstName} ${farmer.lastName}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Acheteur</InputLabel>
                    <Select
                          value={buyerFilter}
                          onChange={(e) => setBuyerFilter(e.target.value)}
                          label="Acheteur"
                          sx={{
                            bgcolor: 'background.default',
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid',
                              borderColor: 'divider',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                              borderWidth: '2px',
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                mt: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                '& .MuiMenuItem-root': {
                                  borderRadius: 0.5,
                                  mx: 0.5,
                                  my: 0.25,
                                }
                              }
                            }
                          }}
                    >
                          <MenuItem value="">Tous les acheteurs</MenuItem>
                          {buyers.map(buyer => (
                            <MenuItem key={buyer} value={buyer}>
                              {buyer}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Statut</InputLabel>
                    <Select
                      value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          label="Statut"
                          sx={{
                            bgcolor: 'background.default',
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid',
                              borderColor: 'divider',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                              borderWidth: '2px',
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                mt: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                '& .MuiMenuItem-root': {
                                  borderRadius: 0.5,
                                  mx: 0.5,
                                  my: 0.25,
                                }
                              }
                            }
                          }}
                    >
                          <MenuItem value="">Tous les statuts</MenuItem>
                      {statuses.map(status => (
                        <MenuItem key={status} value={status}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: statusTranslations[status]?.color === 'success' ? '#4caf50' :
                                             statusTranslations[status]?.color === 'warning' ? '#ff9800' :
                                             statusTranslations[status]?.color === 'info' ? '#2196f3' :
                                             statusTranslations[status]?.color === 'error' ? '#f44336' : '#757575'
                                  }}
                                />
                          {statusTranslations[status]?.label || status}
                              </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                    </Grid>
                </Grid>
              </Grid>

                {/* Tri */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SortIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 'fit-content' }}>
                      Trier par:
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={sortField}
                        onChange={(e) => setSortField(e.target.value as 'date' | 'products')}
                        displayEmpty
                        sx={{
                          bgcolor: 'background.default',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid',
                            borderColor: 'divider',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                            borderWidth: '2px',
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              mt: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                            }
                          }
                        }}
                      >
                        <MenuItem value="date">Date</MenuItem>
                        <MenuItem value="products">Produits</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton
                      onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                sx={{
                        color: 'text.secondary',
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          borderColor: 'primary.main',
                          color: 'primary.main',
                        }
                      }}
                    >
                      {sortOrder === 'desc' ? 
                        <Box sx={{ transform: 'rotate(180deg)' }}>↑</Box> : 
                        <Box>↑</Box>
                      }
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>

              {/* Indicateurs de filtres actifs */}
              {(farmerFilter || buyerFilter || statusFilter || searchQuery) && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Filtres actifs:
                  </Typography>
                  {searchQuery && (
                    <Chip
                      label={`Recherche: "${searchQuery}"`}
                      size="small"
                      onDelete={() => setSearchQuery('')}
                      sx={{
                        bgcolor: 'action.hover',
                        color: 'text.primary',
                        '& .MuiChip-deleteIcon': { color: 'text.secondary' }
                      }}
                    />
                  )}
                  {farmerFilter && (
                    <Chip
                      label={`Agriculteur: ${farmers.find(f => f.id === farmerFilter)?.firstName} ${farmers.find(f => f.id === farmerFilter)?.lastName}`}
                      size="small"
                      onDelete={() => setFarmerFilter('')}
                      sx={{
                        bgcolor: 'action.hover',
                        color: 'text.primary',
                        '& .MuiChip-deleteIcon': { color: 'text.secondary' }
                      }}
                    />
                  )}
                  {buyerFilter && (
                    <Chip
                      label={`Acheteur: ${buyerFilter}`}
                      size="small"
                      onDelete={() => setBuyerFilter('')}
                      sx={{
                        bgcolor: 'action.hover',
                        color: 'text.primary',
                        '& .MuiChip-deleteIcon': { color: 'text.secondary' }
                      }}
                    />
                  )}
                  {statusFilter && (
                    <Chip
                      label={`Statut: ${statusTranslations[statusFilter]?.label || statusFilter}`}
                      size="small"
                      onDelete={() => setStatusFilter('')}
                      sx={{
                        bgcolor: 'action.hover',
                        color: 'text.primary',
                        '& .MuiChip-deleteIcon': { color: 'text.secondary' }
                      }}
                    />
                  )}
                </Box>
              )}
              </Box>
          </Paper>
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
                                      {statusActionTranslations[nextStatus as keyof typeof statusActionTranslations] || nextStatus}
                                    </Button>
                                  ) : null;
                                })()}
                                {isSuperAdmin && order.fields.status === 'completed' && (
                                  <Button size='small' variant='outlined' disabled>Terminé</Button>
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
