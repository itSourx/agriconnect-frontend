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
  Chip,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel
} from '@mui/material'
import { styled, alpha } from '@mui/material/styles'
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  ImageNotSupported as ImageNotSupportedIcon, 
  Inventory as InventoryIcon, 
  MonetizationOn as MonetizationOnIcon, 
  Warning as WarningIcon,
  Category as CategoryIcon, 
  Star as StarIcon, 
  TrendingUp as TrendingUpIcon, 
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material'
import * as XLSX from 'xlsx'
import { api } from 'src/configs/api'
import { toast } from 'react-hot-toast'

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.1)'
  }
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(2),
  background: theme.palette.background.paper,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)'
}))

const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08)
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12)
    }
  }
}))

const ProductCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.1)'
  }
}))

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
  '& .MuiTableHead-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    '& .MuiTableCell-root': {
      borderBottom: 'none',
      fontWeight: 'bold',
      color: theme.palette.text.primary
    }
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      transition: 'background-color 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.02)
      }
    }
  }
}))

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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`https://agriconnect-bc17856a61b8.herokuapp.com/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `bearer ${session?.accessToken}`
        }
      });

      if (response.ok) {
        toast.success('Produit supprimé avec succès');
        fetchProducts();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de la suppression du produit');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erreur lors de la suppression du produit');
    }
  };

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

  const handleExport = () => {
    const exportData = filteredProducts.map(product => ({
      Product: product.fields.Name,
      Description: product.fields.description || '',
      Quantity: product.fields.quantity || '',
      Price: product.fields.price || '',
      Category: product.fields.category || '',
      'Photo URL': product.fields.Photo?.[0]?.url || '',
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'products_export.xlsx');
  };

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

  const StatCard = ({ title, value, icon, color, subtitle }: { title: string; value: string | number; icon: React.ReactNode; color: string; subtitle?: string }) => (
    <StyledCard>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, mr: 1.5, width: 32, height: 32 }}>
            {icon}
          </Avatar>
          <Typography variant='subtitle2' color='text.secondary'>
            {title}
          </Typography>
        </Box>
        <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </StyledCard>
  )

  if (loading) {
    return (
      <Box sx={{ 
        p: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant='h6' sx={{ mt: 3, color: 'text.secondary' }}>
          Chargement des produits...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant='contained' onClick={fetchProducts}>
          Réessayer
        </Button>
      </Box>
    )
  }

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
          Mes Produits
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant='outlined'
            color='secondary'
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            size='small'
          >
            Exporter
          </Button>
          <Button
            variant='contained'
            color='primary'
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
            size='small'
          >
            Ajouter un produit
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <StatCard
            title='Total des produits'
            value={stats?.totalProducts || 0}
            icon={<InventoryIcon sx={{ fontSize: 18 }} />}
            color='#2196f3'
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title='Valeur du stock'
            value={`${stats?.totalStockValue.toLocaleString('fr-FR')} FCFA`}
            icon={<MonetizationOnIcon sx={{ fontSize: 18 }} />}
            color='#4caf50'
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title='Stock faible'
            value={stats?.lowStockProducts || 0}
            icon={<WarningIcon sx={{ fontSize: 18 }} />}
            color='#ff9800'
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title='Catégories'
            value={stats?.totalCategories || 0}
            icon={<CategoryIcon sx={{ fontSize: 18 }} />}
            color='#9c27b0'
          />
        </Grid>

        <Grid item xs={12}>
          <StyledPaper>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <SearchTextField
                placeholder='Rechercher un produit...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon color='action' sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  )
                }}
                size='small'
                sx={{ flexGrow: 1, maxWidth: 300 }}
              />
              <FormControl size='small' sx={{ minWidth: 180 }}>
                <InputLabel id='category-select'>Catégorie</InputLabel>
                <Select
                  labelId='category-select'
                  value={''}
                  onChange={() => {}}
                  input={<OutlinedInput label='Catégorie' />}
                  startAdornment={
                    <InputAdornment position='start'>
                      <FilterListIcon color='action' sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value=''>Toutes les catégories</MenuItem>
                  {Array.from(new Set(products.map(p => p.fields.category))).map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <StyledTableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produit</TableCell>
                    <TableCell>Catégorie</TableCell>
                    <TableCell align='right'>Prix</TableCell>
                    <TableCell align='right'>Stock</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(product => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {product.fields.Photo && product.fields.Photo[0] ? (
                              <img
                                src={product.fields.Photo[0].url}
                                alt={product.fields.Name}
                                style={{
                                  width: 40,
                                  height: 40,
                                  objectFit: 'cover',
                                  borderRadius: 8
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: 'grey.100',
                                  borderRadius: 8,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <ImageNotSupportedIcon sx={{ fontSize: 20, color: 'grey.400' }} />
                              </Box>
                            )}
                            <Box>
                              <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                                {product.fields.Name}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {product.fields.description || 'Aucune description'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={product.fields.category} 
                            size='small'
                            sx={{ 
                              backgroundColor: alpha('#2196f3', 0.1),
                              color: '#2196f3',
                              height: 24,
                              '& .MuiChip-label': {
                                px: 1,
                                fontSize: '0.75rem'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                            {product.fields.price} FCFA
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <Typography 
                              variant='subtitle2' 
                              sx={{ 
                                fontWeight: 'bold',
                                color: parseInt(product.fields.quantity) < 53 ? 'error.main' : 'inherit'
                              }}
                            >
                              {product.fields.quantity} {product.fields.mesure}
                            </Typography>
                            {parseInt(product.fields.quantity) < 53 && (
                              <Tooltip title='Stock faible'>
                                <WarningIcon sx={{ fontSize: 16, color: 'error.main' }} />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align='right'>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <IconButton
                              color='primary'
                              onClick={() => handleEdit(product)}
                              size='small'
                              sx={{ width: 28, height: 28 }}
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton
                              color='error'
                              onClick={() => handleDelete(product.id)}
                              size='small'
                              sx={{ width: 28, height: 28 }}
                            >
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                component='div'
                count={filteredProducts.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </StyledTableContainer>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default MyProducts
