import React, { useEffect, useState, useCallback } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CircularProgress from '@mui/material/CircularProgress';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { exportToCSV } from 'src/utils/csvExport';
import { API_BASE_URL } from 'src/configs/constants';
import axios from 'axios';
import {
  MonetizationOn as MonetizationOnIcon,
  Inventory as InventoryIcon,
  LocalOffer as LocalOfferIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Add as AddIcon
} from '@mui/icons-material';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.1)'
  }
}));

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

const StatCard = ({ title, value, icon, color, subtitle }: { title: string; value: string | number; icon: React.ReactNode; color: string; subtitle?: string }) => (
  <StyledCard sx={{ height: '100%' }}>
    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, mr: 2 }}>
          {icon}
        </Avatar>
        <Typography variant='h6' color='text.secondary'>
          {title}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </CardContent>
  </StyledCard>
);

interface Product {
  id: string;
  fields: {
    Name: string;
    description: string;
    price: string;
    quantity: string;
    category: string;
    mesure: string;
    farmerId: string[];
    Photo: Array<{ url: string }>;
    userFirstName?: string[];
    userLastName?: string[];
    location: string;
  };
}

interface UserData {
  id: string;
  fields: {
    Products: string[];
  };
}

// Fonction utilitaire pour formater les quantités
const formatQuantity = (quantity: string | number): string => {
  const numQuantity = typeof quantity === 'string' ? parseInt(quantity) : quantity
  return numQuantity < 10 ? `0${numQuantity}` : numQuantity.toString()
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [mesureFilter, setMesureFilter] = useState('');
  const [farmerFilter, setFarmerFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  const { notifyProductDeleted, notifyError } = useNotifications();

  // Charger les produits
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    const fetchProducts = async () => {
      const userRole = session?.user?.profileType?.[0];
      const userId = session?.user?.id;
      const token = session?.accessToken;

      if (!token) return;

      try {
        if (userRole === 'AGRICULTEUR' || userRole === 'SUPPLIER') {
          const userResponse = await axios.get<UserData>(`${API_BASE_URL}/users/${userId}`, {
            headers: { Authorization: `bearer ${token}` },
          });
          const userData = userResponse.data;
          const productIds = userData.fields.Products || [];

          const productsData = await Promise.all(
            productIds.map(async (productId: string) => {
              const productResponse = await axios.get<Product>(
                `${API_BASE_URL}/products/${productId}`,
                { headers: { Authorization: `bearer ${token}` } }
              );
              return productResponse.data;
            })
          );
          setProducts(productsData);
          setFilteredProducts(productsData);
        } else {
          const response = await axios.get<Product[]>(`${API_BASE_URL}/products`, {
            headers: { Authorization: `bearer ${token}` },
          });
          const data = response.data;
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        toast.error('Erreur lors de la récupération des produits');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchProducts();
    }
  }, [status, session?.accessToken, session?.user?.id, session?.user?.profileType]);

  // Filtrer les produits
  useEffect(() => {
    let filtered = products;
    if (categoryFilter) {
      filtered = filtered.filter(product => product.fields.category === categoryFilter);
    }
    if (mesureFilter) {
      filtered = filtered.filter(product => product.fields.mesure === mesureFilter);
    }
    if (farmerFilter) {
      filtered = filtered.filter(product => product.fields.farmerId?.includes(farmerFilter));
    }
    if (locationFilter) {
      filtered = filtered.filter(product => product.fields.location === locationFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(product => product.fields.Name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredProducts(filtered);
    setPage(0);
  }, [categoryFilter, mesureFilter, farmerFilter, locationFilter, searchQuery, products]);

  // Calculer les statistiques
  const stats = React.useMemo(() => {
    if (!products.length) return null;

    const totalSales = products.reduce((sum, product) => {
      const price = parseFloat(product.fields.price);
      const quantity = parseInt(product.fields.quantity);
      return sum + (price * quantity);
    }, 0);

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => {
      return sum + parseInt(product.fields.quantity);
    }, 0);

    const averagePrice = totalSales / totalStock || 0;
    const availableProducts = products.filter(p => parseInt(p.fields.quantity) > 0).length;
    const outOfStockProducts = products.filter(p => parseInt(p.fields.quantity) === 0).length;
    const uniqueCategories = new Set(products.map(p => p.fields.category)).size;

    return {
      totalSales,
      totalProducts,
      totalStock,
      averagePrice,
      availableProducts,
      outOfStockProducts,
      uniqueCategories
    };
  }, [products]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = useCallback(async (id: string) => {
    try {
      const token = session?.accessToken;
      if (!token) {
        toast.error('Non autorisé');
        return;
      }

      const productToDelete = products.find(p => p.id === id);
      if (!productToDelete) {
        toast.error('Produit non trouvé');
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/products/${id}`,
        {
          headers: { Authorization: `bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 204) {
        setProducts(prev => prev.filter(product => product.id !== id));
        setFilteredProducts(prev => prev.filter(product => product.id !== id));
        notifyProductDeleted(productToDelete.fields.Name);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err);
      toast.error('Erreur lors de la suppression du produit');
    }
  }, [session?.accessToken, products, notifyProductDeleted]);

  const handleEdit = useCallback((id: string) => {
    router.push(`/products/edit-product/${id}`);
  }, [router]);

  const handleExport = useCallback(() => {
    const exportData = filteredProducts.map((product: Product) => ({
      Nom: product.fields.Name,
      Description: product.fields.description || '',
      Quantité: product.fields.quantity || '',
      Prix: product.fields.price || '',
      Catégorie: product.fields.category || '',
      'URL Photo': product.fields.Photo?.[0]?.url || '',
    }));

    exportToCSV(exportData, 'products_export');
  }, [filteredProducts]);

  const categories = [...new Set(products.map((p: Product) => p.fields.category).filter(Boolean))];
  const mesures = [...new Set(products.map((p: Product) => p.fields.mesure).filter(Boolean))];
  const locations = [...new Set(products.map((p: Product) => p.fields.location).filter(Boolean))];
  const farmers = Array.from(
    new Map(
      products.map((p: Product) => [
        p.fields.farmerId?.[0],
        {
          id: p.fields.farmerId?.[0],
          firstName: p.fields.userFirstName?.[0],
          lastName: p.fields.userLastName?.[0],
        },
      ])
    ).values()
  ).filter((f: any) => f.id);

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      ) : (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          {/* Statistiques */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Valeur du stock"
                value={`${stats?.totalSales.toLocaleString('fr-FR')} FCFA`}
                icon={<MonetizationOnIcon />}
                color="#4caf50"
                subtitle="Valeur totale"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Produits en stock"
                value={stats?.availableProducts || 0}
                icon={<InventoryIcon />}
                color="#2196f3"
                subtitle={`sur ${stats?.totalProducts} produits`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Prix moyen"
                value={`${stats?.averagePrice.toLocaleString('fr-FR')} FCFA`}
                icon={<LocalOfferIcon />}
                color="#ff9800"
                subtitle="Par unité"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Catégories"
                value={stats?.uniqueCategories || 0}
                icon={<CheckCircleIcon />}
                color="#9c27b0"
                subtitle="Types de produits"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
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
                <FilterListIcon sx={{ color: 'primary.main', mr: 1, fontSize: 24 }} />
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
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant='outlined'
                    size='small'
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                    sx={{
                      borderColor: 'divider',
                      color: 'text.secondary',
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                      }
                    }}
                  >
                    Exporter
                  </Button>
                  <Button
                    variant='contained'
                    color='primary'
                    startIcon={<AddIcon />}
                    href='/products/add'
                    size='small'
                  >
                    Ajouter un produit
                  </Button>
                </Box>
              </Box>

              {/* Barre de recherche principale */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  placeholder="Rechercher un produit..."
                  variant="outlined"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
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

              {/* Filtres */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Catégorie</InputLabel>
                    <Select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      label="Catégorie"
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
                      <MenuItem value=''>Toutes les catégories</MenuItem>
                      {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Mesure</InputLabel>
                    <Select
                      value={mesureFilter}
                      onChange={e => setMesureFilter(e.target.value)}
                      label="Mesure"
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
                      <MenuItem value=''>Toutes les mesures</MenuItem>
                      {mesures.map(mes => (
                        <MenuItem key={mes} value={mes}>
                          {mes}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Localisation</InputLabel>
                        <Select
                          value={locationFilter}
                          onChange={e => setLocationFilter(e.target.value)}
                          label="Localisation"
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
                          <MenuItem value=''>Toutes les localisations</MenuItem>
                          {locations.map(loc => (
                            <MenuItem key={loc} value={loc}>
                              {loc}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Agriculteur</InputLabel>
                    <Select
                      value={farmerFilter}
                      onChange={e => setFarmerFilter(e.target.value)}
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
                      <MenuItem value=''>Tous les agriculteurs</MenuItem>
                      {farmers.map(farmer => (
                        <MenuItem key={farmer.id} value={farmer.id}>
                          {`${farmer.firstName} ${farmer.lastName}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Indicateurs de filtres actifs */}
              {(categoryFilter || mesureFilter || locationFilter || farmerFilter || searchQuery) && (
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
                  {categoryFilter && (
                    <Chip
                      label={`Catégorie: ${categoryFilter}`}
                      size="small"
                      onDelete={() => setCategoryFilter('')}
                      sx={{
                        bgcolor: 'action.hover',
                        color: 'text.primary',
                        '& .MuiChip-deleteIcon': { color: 'text.secondary' }
                      }}
                    />
                  )}
                  {mesureFilter && (
                    <Chip
                      label={`Mesure: ${mesureFilter}`}
                      size="small"
                      onDelete={() => setMesureFilter('')}
                      sx={{
                        bgcolor: 'action.hover',
                        color: 'text.primary',
                        '& .MuiChip-deleteIcon': { color: 'text.secondary' }
                      }}
                    />
                  )}
                  {locationFilter && (
                    <Chip
                      label={`Localisation: ${locationFilter}`}
                      size="small"
                      onDelete={() => setLocationFilter('')}
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
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table aria-label='products table'>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Produit</StyledTableCell>
                      <StyledTableCell>Description</StyledTableCell>
                        <StyledTableCell>Agriculteur</StyledTableCell>
                      <StyledTableCell>Quantité</StyledTableCell>
                      <StyledTableCell>Prix</StyledTableCell>
                      <StyledTableCell>Catégorie</StyledTableCell>
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                      <StyledTableRow key={row.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {row.fields.Photo?.length > 0 && (
                              <Avatar
                                src={row.fields.Photo[0].url}
                                alt={row.fields.Name}
                                sx={{ width: 40, height: 40 }}
                              />
                            )}
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                              {row.fields.Name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' color="text.secondary">
                            {row.fields.description || 'Aucune description'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                              {row.fields.userFirstName?.[0] && row.fields.userLastName?.[0] 
                                ? `${row.fields.userFirstName[0]} ${row.fields.userLastName[0]}`
                                : 'Non spécifié'
                              }
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                                {formatQuantity(row.fields.quantity)}
                            </Typography>
                            <Typography variant='body2' color="text.secondary">
                              {row.fields.mesure}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                            {row.fields.price} FCFA
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor: alpha('#2196f3', 0.1),
                              color: '#2196f3',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {row.fields.category}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton 
                              color='primary' 
                              size='small' 
                              onClick={() => handleEdit(row.id)}
                            >
                                <VisibilityIcon style={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton 
                              color='error' 
                              size='small' 
                              onClick={() => handleDelete(row.id)}
                            >
                              <DeleteIcon style={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component='div'
                count={filteredProducts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Lignes par page:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
      )}
    </Box>
  );
};

export default Products;