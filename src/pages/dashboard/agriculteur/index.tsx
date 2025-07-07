import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material'
import {
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  MonetizationOn as MonetizationOnIcon,
  Warning as WarningIcon,
  Category as CategoryIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { api } from 'src/configs/api'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from 'src/configs/constants'

interface DashboardStats {
  totalProducts: number
  lowStockProducts: number
  totalOrders: number
  pendingOrders: number
  totalClients: number
  totalRevenue: number
  categories: { [key: string]: number }
}

const DashboardAgriculteur = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [showTokenAlert, setShowTokenAlert] = useState(false)

  // Gérer l'état de chargement initial
  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
    } else if (status === 'unauthenticated') {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }, [status, router])

  useEffect(() => {
    if (session?.accessToken) {
      setShowTokenAlert(true)
      // Cacher l'alerte après 5 secondes
      const timer = setTimeout(() => {
        setShowTokenAlert(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [session?.accessToken])

  useEffect(() => {
    if (session?.user?.resetPasswordUsed) {
      setShowResetModal(true)
    }
  }, [session?.user?.resetPasswordUsed])

  const handleResetPassword = async () => {
    console.log('session', session)
    if (!session?.accessToken) return

    if (newPassword !== confirmPassword) {
      setResetError('Les mots de passe ne correspondent pas')
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (newPassword.length < 6) {
      setResetError('Le mot de passe doit contenir au moins 6 caractères')
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      setResetLoading(true)
      setResetError(null)

      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          newPassword
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors du changement de mot de passe')
      }

      // Mettre à jour la session pour indiquer que le mot de passe a été changé
      await fetch('/api/auth/session', { method: 'POST' })
      setShowResetModal(false)
      toast.success('Mot de passe changé avec succès')
      router.reload()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe'
      setResetError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setResetLoading(false)
    }
  }

  const fetchStats = async () => {

    console.log('session', session)

    if (!session?.user?.id || !session?.accessToken) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('Fetching stats for user:', session.user.id)

      // Récupérer les produits
      const productsResponse = await api.get('/products')
      const userProducts = (productsResponse.data as any[]).filter((p: any) => p.fields.user?.[0] === session.user.id)

      // Récupérer les commandes
      const ordersResponse = await api.get(
        `${API_BASE_URL}/orders/byfarmer/${session?.user?.id}`,
        {
          headers: {
            accept: '*/*',
            Authorization: `bearer ${session.accessToken}`
          }
        }
      )
      const userOrders = (ordersResponse.data as any).data || []

      // Filtrer les commandes par statut
      const completedOrders = userOrders.filter((o: any) => o.status === 'completed')
      const pendingOrders = userOrders.filter((o: any) => o.status === 'pending')
      const confirmedOrders = userOrders.filter((o: any) => o.status === 'confirmed')
      const deliveredOrders = userOrders.filter((o: any) => o.status === 'delivered')

      // Calculer le total des revenus (toutes les commandes sauf pending)
      const totalRevenue = [...confirmedOrders, ...deliveredOrders, ...completedOrders]
        .reduce((sum: number, o: any) => sum + (parseFloat(o.totalAmount) || 0), 0)

      // Calculer les statistiques
      const stats: DashboardStats = {
        totalProducts: userProducts.length,
        lowStockProducts: userProducts.filter((p: any) => parseInt(p.fields.quantity) < 53).length,
        totalOrders: userOrders.length,
        pendingOrders: pendingOrders.length,
        totalClients: new Set(userOrders.map((o: any) => o.buyer?.[0])).size,
        totalRevenue: totalRevenue,
        categories: userProducts.reduce((acc: { [key: string]: number }, p: any) => {
          acc[p.fields.category] = (acc[p.fields.category] || 0) + 1
          return acc
        }, {})
      }

      console.log('Stats calculated:', stats)
      setStats(stats)
    } catch (err: any) {
      console.error('Error fetching stats:', err)
      if (err.response?.status === 401) {
        router.push('/auth/login')
        return
      }
      setError('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchStats()
    }
  }, [session?.user?.id])

  // Écouter les changements de route pour mettre à jour les données
  useEffect(() => {
    const handleRouteChange = () => {
      if (session?.user?.id) {
        fetchStats()
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router, session?.user?.id])

  if (session?.user?.resetPasswordUsed) {
    return (
      <Dialog
        open={true}
        onClose={() => { }}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>
          Changement de mot de passe requis
          <IconButton
            aria-label="close"
            onClick={() => { }}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            disabled
          >

          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Pour des raisons de sécurité, vous devez changer votre mot de passe avant de continuer.
          </Typography>
          <TextField
            fullWidth
            label="Nouveau mot de passe"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!resetError}
            helperText={resetError}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleResetPassword}
            variant="contained"
            color="primary"
            disabled={resetLoading}
          >
            {resetLoading ? <CircularProgress size={24} /> : 'Mettre à jour le mot de passe'}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity='error'>{error}</Alert>
      </Box>
    )
  }

  // Si pas de données, afficher un message
  if (!stats) {
    return (
      <Box p={3}>
        <Typography variant='h4' gutterBottom>
          Tableau de bord
        </Typography>
        <Alert severity='info'>
          Bienvenue ! Commencez par ajouter vos premiers produits pour voir vos statistiques.
        </Alert>
        <Box mt={3}>
          <Button
            variant='contained'
            color='primary'
            startIcon={<InventoryIcon />}
            onClick={() => router.push('/products/myproducts')}
          >
            Ajouter mon premier produit
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
          Tableau de bord
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {/* Statistiques principales */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center' mb={2}>
                <InventoryIcon color='primary' sx={{ mr: 1 }} />
                <Typography variant='h6'>Produits</Typography>
              </Box>
              <Typography variant='h4'>{stats?.totalProducts || 0}</Typography>
              <Typography color='text.secondary'>{stats?.lowStockProducts || 0} en stock faible</Typography>
              <Button
                variant='outlined'
                color='primary'
                startIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/products/myproducts')}
                sx={{ mt: 2 }}
              >
                Gérer les produits
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center' mb={2}>
                <ShoppingCartIcon color='primary' sx={{ mr: 1 }} />
                <Typography variant='h6'>Commandes</Typography>
              </Box>
              <Typography variant='h4'>{stats?.totalOrders || 0}</Typography>
              <Typography color='text.secondary'>{stats?.pendingOrders || 0} en attente</Typography>
              <Button
                variant='outlined'
                color='primary'
                startIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/orders')}
                sx={{ mt: 2 }}
              >
                Voir les commandes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center' mb={2}>
                <PeopleIcon color='primary' sx={{ mr: 1 }} />
                <Typography variant='h6'>Clients</Typography>
              </Box>
              <Typography variant='h4'>{stats?.totalClients || 0}</Typography>
              <Typography color='text.secondary'>Clients uniques</Typography>
              <Button
                variant='outlined'
                color='primary'
                startIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/clients')}
                sx={{ mt: 2 }}
              >
                Voir les clients
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center' mb={2}>
                <MonetizationOnIcon color='primary' sx={{ mr: 1 }} />
                <Typography variant='h6'>Revenus</Typography>
              </Box>
              <Typography variant='h4'>{stats?.totalRevenue.toFixed(2)} F CFA</Typography>
              <Typography color='text.secondary'>Total des ventes</Typography>
              <Button
                variant='outlined'
                color='primary'
                startIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/reports')}
                sx={{ mt: 2 }}
              >
                Voir les rapports
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Catégories de produits */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center' mb={2}>
                <CategoryIcon color='primary' sx={{ mr: 1 }} />
                <Typography variant='h6'>Catégories de produits</Typography>
              </Box>
              <List>
                {Object.entries(stats?.categories || {}).map(([category, count]) => (
                  <ListItem key={category}>
                    <ListItemText primary={category} secondary={`${count} produit${count > 1 ? 's' : ''}`} />
                  </ListItem>
                ))}
              </List>
              <Button
                variant='outlined'
                color='primary'
                startIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/products/myproducts')}
                sx={{ mt: 2 }}
              >
                Gérer les catégories
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Produits en stock faible */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center' mb={2}>
                <WarningIcon color='warning' sx={{ mr: 1 }} />
                <Typography variant='h6'>Produits en stock faible</Typography>
              </Box>
              <Typography variant='h4' color='warning.main'>
                {stats?.lowStockProducts || 0}
              </Typography>
              <Typography color='text.secondary'>Produits avec moins de 53 unités en stock</Typography>
              <Button
                variant='outlined'
                color='warning'
                startIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/products/myproducts')}
                sx={{ mt: 2 }}
              >
                Voir les produits en stock faible
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardAgriculteur
