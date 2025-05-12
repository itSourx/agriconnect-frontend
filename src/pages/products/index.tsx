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
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import EditBoxLineIcon from 'remixicon-react/EditBoxLineIcon';
import DeleteBinLineIcon from 'remixicon-react/DeleteBinLineIcon';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { alpha } from '@mui/material/styles';
import { useNotifications } from '@/hooks/useNotifications'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': { fontWeight: 'bold' },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
  '&:last-child td, &:last-child th': { border: 0 },
}));

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
  };
}

interface UserData {
  id: string;
  fields: {
    Products: string[];
  };
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [mesureFilter, setMesureFilter] = useState('');
  const [farmerFilter, setFarmerFilter] = useState('');
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

      try {
        if (userRole === 'AGRICULTEUR' || userRole === 'SUPPLIER') {
          const userResponse = await axios.get<UserData>(`https://agriconnect-bc17856a61b8.herokuapp.com/users/${userId}`, {
            headers: { Authorization: `bearer ${token}` },
          });
          const userData = userResponse.data;
          const productIds = userData.fields.Products || [];

          const productsData = await Promise.all(
            productIds.map(async (productId: string) => {
              const productResponse = await axios.get<Product>(
                `https://agriconnect-bc17856a61b8.herokuapp.com/products/${productId}`,
                { headers: { Authorization: `bearer ${token}` } }
              );
              return productResponse.data;
            })
          );
          console.log(productsData);
          setProducts(productsData);
          setFilteredProducts(productsData);
        } else {
          const response = await axios.get<Product[]>('https://agriconnect-bc17856a61b8.herokuapp.com/products', {
            headers: { Authorization: `bearer ${token}` },
          });
          const data = response.data;
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        notifyError('Erreur lors de la récupération des produits');
      }
    };

    fetchProducts();
  }, [session, status, router, notifyError]);

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
    if (searchQuery) {
      filtered = filtered.filter(product => product.fields.Name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredProducts(filtered);
    setPage(0);
  }, [categoryFilter, mesureFilter, farmerFilter, searchQuery, products]);

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

    const averagePrice = totalSales / totalStock;
    const availableProducts = products.filter(p => parseInt(p.fields.quantity) > 0).length;
    const availabilityRate = (availableProducts / totalProducts) * 100;

    return {
      totalSales,
      totalProducts,
      totalStock,
      averagePrice,
      availabilityRate
    };
  }, [products]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = session?.accessToken;
      if (!token) {
        notifyError('Non autorisé');
        return;
      }

      const productToDelete = products.find(p => p.id === id);
      if (!productToDelete) {
        notifyError('Produit non trouvé');
        return;
      }

      const response = await axios.delete(
        `https://agriconnect-bc17856a61b8.herokuapp.com/products/${id}`,
        {
          headers: { Authorization: `bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 204) {
        setProducts(products.filter(product => product.id !== id));
        setFilteredProducts(filteredProducts.filter(product => product.id !== id));
        notifyProductDeleted(productToDelete.fields.Name);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err);
      notifyError('Erreur lors de la suppression du produit');
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/products/edit-product/${id}`);
  };

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

  const categories = [...new Set(products.map(p => p.fields.category).filter(Boolean))];
  const mesures = [...new Set(products.map(p => p.fields.mesure).filter(Boolean))];
  const farmers = Array.from(
    new Map(
      products.map(p => [
        p.fields.farmerId?.[0],
        {
          id: p.fields.farmerId?.[0],
          firstName: p.fields.userFirstName?.[0],
          lastName: p.fields.userLastName?.[0],
        },
      ])
    ).values()
  ).filter(f => f.id);

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          {/* Statistiques */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
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
                        Prix stock
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 500 }}>
                        {stats?.totalSales.toLocaleString('fr-FR')} F CFA
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      color: 'primary.main',
                      opacity: 0.7
                    }}>
                      <i className="ri-money-dollar-circle-line" style={{ fontSize: '2rem' }}></i>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
                        Nombre de produits
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 500 }}>
                        {stats?.totalProducts.toLocaleString('fr-FR')}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      color: 'success.main',
                      opacity: 0.7
                    }}>
                      <i className="ri-box-3-line" style={{ fontSize: '2rem' }}></i>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
                        Prix moyen
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 500 }}>
                        {stats?.averagePrice.toLocaleString('fr-FR')} F CFA
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      color: 'text.secondary',
                      opacity: 0.7
                    }}>
                      <i className="ri-price-tag-3-line" style={{ fontSize: '2rem' }}></i>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
                        Disponibilité
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 500 }}>
                        {stats?.availabilityRate.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      color: 'text.secondary',
                      opacity: 0.7
                    }}>
                      <i className="ri-checkbox-circle-line" style={{ fontSize: '2rem' }}></i>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title='Filtres' />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='category-select'>Catégorie</InputLabel>
                    <Select
                      labelId='category-select'
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      input={<OutlinedInput label='Catégorie' />}
                    >
                      <MenuItem value=''>Toutes</MenuItem>
                      {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='mesure-select'>Mesure</InputLabel>
                    <Select
                      labelId='mesure-select'
                      value={mesureFilter}
                      onChange={e => setMesureFilter(e.target.value)}
                      input={<OutlinedInput label='Mesure' />}
                    >
                      <MenuItem value=''>Toutes</MenuItem>
                      {mesures.map(mes => (
                        <MenuItem key={mes} value={mes}>
                          {mes}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='farmer-select'>Agriculteur</InputLabel>
                    <Select
                      labelId='farmer-select'
                      value={farmerFilter}
                      onChange={e => setFarmerFilter(e.target.value)}
                      input={<OutlinedInput label='Agriculteur' />}
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
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 4,
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                }}
              >
                <TextField
                  placeholder='Rechercher un produit'
                  variant='outlined'
                  size='small'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  sx={{ maxWidth: { sm: '300px' }, width: '100%' }}
                />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
                  <Button
                    variant='outlined'
                    color='secondary'
                    startIcon={<i className='ri-upload-2-line'></i>}
                    onClick={handleExport}
                    fullWidth={true}
                    sx={{ flexGrow: 1 }}
                  >
                    Exporter
                  </Button>
                  <Button
                    variant='contained'
                    color='primary'
                    startIcon={<i className='ri-add-line'></i>}
                    href='/products/add'
                    fullWidth={true}
                    sx={{ flexGrow: 1 }}
                  >
                    Ajouter un produit
                  </Button>
                </Box>
              </Box>

              <TableContainer sx={{ overflowX: 'auto', mt: 2 }}>
                <Table aria-label='products table'>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>
                        <Checkbox />
                      </StyledTableCell>
                      <StyledTableCell>Produit</StyledTableCell>
                      <StyledTableCell>Description</StyledTableCell>
                      <StyledTableCell>Quantité</StyledTableCell>
                      <StyledTableCell>Prix</StyledTableCell>
                      <StyledTableCell>Catégorie</StyledTableCell>
                      <StyledTableCell>Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                      <StyledTableRow key={row.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {row.fields.Photo?.length > 0 && (
                              <img
                                width='38'
                                height='38'
                                className='rounded bg-actionHover'
                                src={row.fields.Photo[0].url}
                                alt={row.fields.Name}
                              />
                            )}
                            <Typography variant='body1' sx={{ fontWeight: 500 }}>
                              {row.fields.Name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{row.fields.description}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body1'>
                            {row.fields.quantity} {row.fields.mesure}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body1'>{row.fields.price}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body1'>{row.fields.category}</Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton color='primary' size='small' onClick={() => handleEdit(row.id)}>
                            <EditBoxLineIcon style={{ fontSize: 22, color: 'var(--mui-palette-text-secondary)' }} />
                          </IconButton>
                          <IconButton color='error' size='small' onClick={() => handleDelete(row.id)}>
                            <DeleteBinLineIcon style={{ fontSize: 22, color: 'var(--mui-palette-error-main)' }} />
                          </IconButton>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component='div'
                count={filteredProducts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Nombre de produits par page:"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Products;