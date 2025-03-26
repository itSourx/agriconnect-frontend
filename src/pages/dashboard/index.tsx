import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import api from 'src/api/axiosConfig'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  recentOrders: any[]
  topProducts: any[]
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)'
  }
}))

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: [],
    topProducts: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchDashboardData = async () => {
      const userId = session?.user?.id

      if (!userId) {
        router.push('/auth/login')
        return
      }

      try {
        setIsLoading(true)
        
        // Récupérer les produits de l'agriculteur
        const userResponse = await api.get(`https://agriconnect-bc17856a61b8.herokuapp.com/users/${userId}`, {
          headers: { Accept: '*/*' }
        })
        const productIds = userResponse.data.fields.Products || []
        const productsData = await Promise.all(
          productIds.map(async (productId: string) => {
            const productResponse = await api.get(
              `https://agriconnect-bc17856a61b8.herokuapp.com/products/${productId}`,
              { headers: { Accept: '*/*' } }
            )
            return productResponse.data
          })
        )

        // Récupérer les commandes de l'agriculteur
        const ordersResponse = await api.get('https://agriconnect-bc17856a61b8.herokuapp.com/orders', {
          headers: { Accept: '*/*' }
        })
        const farmerOrders = ordersResponse.data.filter((order: any) => 
          order.fields.farmerId?.includes(userId)
        )

        // Calculer les statistiques
        const totalRevenue = farmerOrders.reduce((sum: number, order: any) => sum + order.fields.totalPrice, 0)
        const pendingOrders = farmerOrders.filter((order: any) => order.fields.Status === 'pending').length

        // Trier les produits par nombre de commandes
        const productOrderCounts = new Map()
        farmerOrders.forEach((order: any) => {
          order.fields.productName?.forEach((productName: string, index: number) => {
            const count = productOrderCounts.get(productName) || 0
            productOrderCounts.set(productName, count + 1)
          })
        })

        const topProducts = Array.from(productOrderCounts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        // Trier les commandes récentes
        const recentOrders = farmerOrders
          .sort((a: any, b: any) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
          .slice(0, 5)

        setStats({
          totalProducts: productsData.length,
          totalOrders: farmerOrders.length,
          totalRevenue,
          pendingOrders,
          recentOrders,
          topProducts
        })
      } catch (err) {
        setError('Erreur lors de la récupération des données')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [router, session, status])

  if (isLoading) {
    return <Box sx={{ p: 4 }}>Chargement...</Box>
  }

  if (error) {
    return <Box sx={{ p: 4, color: 'error.main' }}>{error}</Box>
  }

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        {/* Statistiques principales */}
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Produits en vente
              </Typography>
              <Typography variant='h4'>{stats.totalProducts}</Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Commandes totales
              </Typography>
              <Typography variant='h4'>{stats.totalOrders}</Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Chiffre d'affaires
              </Typography>
              <Typography variant='h4'>{stats.totalRevenue.toLocaleString('fr-FR')} FCFA</Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Commandes en attente
              </Typography>
              <Typography variant='h4'>{stats.pendingOrders}</Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Commandes récentes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Commandes récentes
              </Typography>
              <Box sx={{ mt: 2 }}>
                {stats.recentOrders.map((order: any) => (
                  <Box key={order.id} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant='subtitle1'>
                      {order.fields.buyerFirstName?.[0]} {order.fields.buyerLastName?.[0]}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {order.fields.productName?.[0]} - {order.fields.Qty} unités
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {new Date(order.createdTime).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Produits les plus vendus */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Produits les plus vendus
              </Typography>
              <Box sx={{ mt: 2 }}>
                {stats.topProducts.map((product, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant='subtitle1'>{product.name}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {product.count} commandes
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage 