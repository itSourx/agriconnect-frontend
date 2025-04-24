// pages/products-products.tsx
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  Tooltip,
  Grid,
  Card,
  CardContent
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, ImageNotSupported as ImageNotSupportedIcon, 
  Inventory as InventoryIcon, MonetizationOn as MonetizationOnIcon, Warning as WarningIcon,
  Category as CategoryIcon, Star as StarIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material'
import { api } from 'src/configs/api'

interface Product {
  id: string
  fields: {
    Name: string
    description?: string
    price: string
    quantity: string
    category: string
    mesure: string
    Photo?: Array<{
      url: string
      filename: string
    }>
    location?: string
    CreatedDate: string
    LastModifiedDate: string
    user?: string[]
  }
}

const MyProducts = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    fetchProducts()
  }, [session])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get<Product[]>('/products')
      const userProducts = response.data.filter(
        product => product.fields.user?.[0] === session?.user?.id
      )
      setProducts(userProducts)
    } catch (err) {
      setError('Erreur lors du chargement des produits')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    router.push(`/products/edit-product/${product.id}`)
  }

  const handleDelete = async (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        const token = session?.accessToken;
        if (!token) {
          throw new Error('Vous devez être connecté pour supprimer un produit');
        }
        await api.delete(`/products/${productId}`, {
          headers: {
            Authorization: `bearer ${token}`,
          },
        });
        setProducts(products.filter(product => product.id !== productId))
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la suppression du produit:', err);
        alert('Erreur lors de la suppression du produit')
      }
    }
  }

  const handleAddProduct = () => {
    router.push('/products/add')
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const filteredProducts = products.filter(product =>
    product.fields.Name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculer les statistiques
  const stats = React.useMemo(() => {
    if (!products.length) return null;

    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, product) => {
      return sum + (parseFloat(product.fields.price) * parseInt(product.fields.quantity));
    }, 0);

    const lowStockProducts = products.filter(product => {
      const quantity = parseInt(product.fields.quantity);
      return quantity < 53; // Seuil fixé à 50 pour toutes les mesures
    }).length;

    const categories = new Set(products.map(p => p.fields.category));
    const totalCategories = categories.size;

    const mostExpensiveProduct = products.reduce((max, product) => {
      return parseFloat(product.fields.price) > parseFloat(max.fields.price) ? product : max;
    });

    const mostStockedProduct = products.reduce((max, product) => {
      return parseInt(product.fields.quantity) > parseInt(max.fields.quantity) ? product : max;
    });

    return {
      totalProducts,
      totalStockValue,
      lowStockProducts,
      totalCategories,
      mostExpensiveProduct,
      mostStockedProduct
    };
  }, [products]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Mes Produits</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
        >
          Ajouter un produit
        </Button>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: 1
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total des produits
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 500 }}>
                    {stats?.totalProducts || 0}
                  </Typography>
                </Box>
                <InventoryIcon sx={{ color: 'primary.main', fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: 1
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Valeur du stock
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 500 }}>
                    {stats?.totalStockValue.toLocaleString('fr-FR')} FCFA
                  </Typography>
                </Box>
                <MonetizationOnIcon sx={{ color: 'primary.main', fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: 1
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Produits en stock faible
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 500, color: (stats?.lowStockProducts ?? 0) > 0 ? 'warning.main' : 'success.main' }}>
                    {stats?.lowStockProducts ?? 0}
                  </Typography>
                </Box>
                <WarningIcon sx={{ color: (stats?.lowStockProducts ?? 0) > 0 ? 'warning.main' : 'success.main', fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: 1
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Catégories de produits
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 500 }}>
                    {stats?.totalCategories || 0}
                  </Typography>
                </Box>
                <CategoryIcon sx={{ color: 'primary.main', fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: 1
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Produit le plus cher
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 500 }}>
                    {parseFloat(stats?.mostExpensiveProduct?.fields.price || '0').toLocaleString('fr-FR')} FCFA
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats?.mostExpensiveProduct?.fields.Name}
                  </Typography>
                </Box>
                <StarIcon sx={{ color: 'primary.main', fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: 1
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Produit le plus stocké
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 500 }}>
                    {parseInt(stats?.mostStockedProduct?.fields.quantity || '0')} {stats?.mostStockedProduct?.fields.mesure}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats?.mostStockedProduct?.fields.Name}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Rechercher un produit..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Localisation</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(product => (
                <TableRow key={product.id} sx={{
                  backgroundColor: parseInt(product.fields.quantity) < 53 ? 'rgba(211, 47, 47, 0.08)' : 'inherit',
                  '&:hover': {
                    backgroundColor: parseInt(product.fields.quantity) < 53 ? 'rgba(211, 47, 47, 0.12)' : 'action.hover'
                  }
                }}>
                  <TableCell>
                    {product.fields.Photo && product.fields.Photo[0] ? (
                      <img
                        src={product.fields.Photo[0].url}
                        alt={product.fields.Name}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    ) : (
                      <Box display="flex" alignItems="center" color="text.secondary">
                        <ImageNotSupportedIcon />
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {parseInt(product.fields.quantity) < 53 && (
                        <Tooltip title="Stock faible">
                          <WarningIcon sx={{ color: 'error.main', opacity: 0.8 }} fontSize="small" />
                        </Tooltip>
                      )}
                      {product.fields.Name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={product.fields.description || 'Aucune description'}>
                      <Typography noWrap>
                        {product.fields.description || 'Aucune description'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{product.fields.price} FCFA</TableCell>
                  <TableCell>
                    <Typography sx={{ 
                      color: parseInt(product.fields.quantity) < 53 ? 'error.main' : 'inherit',
                      fontWeight: parseInt(product.fields.quantity) < 53 ? 'bold' : 'normal',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      {product.fields.quantity} {product.fields.mesure}
                      {parseInt(product.fields.quantity) < 53 && (
                        <Tooltip title="Stock faible">
                          <WarningIcon sx={{ color: 'error.main', opacity: 0.8 }} fontSize="small" />
                        </Tooltip>
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={product.fields.category} size="small" />
                  </TableCell>
                  <TableCell>{product.fields.location || 'Non spécifié'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(product)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(product.id)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredProducts.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page"
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Box>
  )
}

export default MyProducts
