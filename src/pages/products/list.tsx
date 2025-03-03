import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
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
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': { fontWeight: 'bold' },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
  '&:last-child td, &:last-child th': { border: 0 },
}));

const SalesOverview = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [mesureFilter, setMesureFilter] = useState('');
  const [farmerFilter, setFarmerFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Charger les produits
  useEffect(() => {
    fetch('https://agriconnect-bc17856a61b8.herokuapp.com/products')
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data); // Initialisation avec tous les produits
      })
      .catch(error => console.error('Erreur lors de la récupération des produits:', error));
  }, []);

  // Filtrer les produits en fonction des filtres et de la recherche
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
      filtered = filtered.filter(product =>
        product.fields.Name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
    setPage(0); // Réinitialiser la pagination
  }, [categoryFilter, mesureFilter, farmerFilter, searchQuery, products]);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = id => {
    fetch(`https://agriconnect-bc17856a61b8.herokuapp.com/products/${id}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (response.ok) {
          setProducts(products.filter(product => product.id !== id));
          setFilteredProducts(filteredProducts.filter(product => product.id !== id));
        } else {
          console.error('Erreur lors de la suppression du produit');
        }
      })
      .catch(error => console.error('Erreur lors de la suppression du produit:', error));
  };

  const handleEdit = id => {
    router.push(`/products/edit-product/${id}`);
  };

  // Exporter en Excel
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

  const salesData = [
    { title: 'In-Store Sales', amount: '$5,345', orders: '5k orders', percentage: '5.7%', icon: 'ri-home-6-line', color: 'success' },
    { title: 'Website Sales', amount: '$74,347', orders: '21k orders', percentage: '12.4%', icon: 'ri-computer-line', color: 'success' },
    { title: 'Discount', amount: '$14,235', orders: '6k orders', icon: 'ri-gift-line' },
    { title: 'Affiliate', amount: '$8,345', orders: '150 orders', percentage: '-3.5%', icon: 'ri-money-dollar-circle-line', color: 'error' },
  ];

  // Options uniques pour les filtres
  const categories = [...new Set(products.map(p => p.fields.category).filter(Boolean))];
  const mesures = [...new Set(products.map(p => p.fields.mesure).filter(Boolean))];
  
  // Extraire les agriculteurs uniques depuis les produits
  const farmers = Array.from(
    new Map(products.map(p => [
      p.fields.farmerId?.[0], // Utilise farmerId comme clé unique
      {
        id: p.fields.farmerId?.[0],
        firstName: p.fields.userFirstName?.[0],
        lastName: p.fields.userLastName?.[0],
      },
    ])).values()
  ).filter(f => f.id); // Filtrer les entrées sans farmerId

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={6}>
                {salesData.map((sale, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body1">{sale.title}</Typography>
                          <Typography variant="h4">{sale.amount}</Typography>
                        </Box>
                        <Avatar variant="rounded" sx={{ bgcolor: 'action.disabledBackground', color: 'text.primary' }} size={44}>
                          <i className={`${sale.icon} text-[28px]`}></i>
                        </Avatar>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1">{sale.orders}</Typography>
                        {sale.percentage && <Chip label={sale.percentage} color={sale.color} size="small" variant="tonal" />}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title="Filtres" />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="category-select">Catégorie</InputLabel>
                    <Select
                      labelId="category-select"
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      input={<OutlinedInput label="Catégorie" />}
                    >
                      <MenuItem value="">Toutes</MenuItem>
                      {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="mesure-select">Mesure</InputLabel>
                    <Select
                      labelId="mesure-select"
                      value={mesureFilter}
                      onChange={e => setMesureFilter(e.target.value)}
                      input={<OutlinedInput label="Mesure" />}
                    >
                      <MenuItem value="">Toutes</MenuItem>
                      {mesures.map(mes => (
                        <MenuItem key={mes} value={mes}>{mes}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="farmer-select">Agriculteur</InputLabel>
                    <Select
                      labelId="farmer-select"
                      value={farmerFilter}
                      onChange={e => setFarmerFilter(e.target.value)}
                      input={<OutlinedInput label="Agriculteur" />}
                    >
                      <MenuItem value="">Tous</MenuItem>
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <TextField
                  placeholder="Rechercher un produit"
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  sx={{ maxWidth: { sm: '300px' }, width: '100%' }}
                />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<i className="ri-upload-2-line"></i>}
                    onClick={handleExport}
                    fullWidth={true}
                    sx={{ flexGrow: 1 }}
                  >
                    Exporter
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<i className="ri-add-line"></i>}
                    href="/products/add"
                    fullWidth={true}
                    sx={{ flexGrow: 1 }}
                  >
                    Ajouter un produit
                  </Button>
                </Box>
              </Box>

              <TableContainer sx={{ overflowX: 'auto', mt: 2 }}>
                <Table aria-label="products table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell><Checkbox /></StyledTableCell>
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
                        <TableCell><Checkbox /></TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {row.fields.Photo?.length > 0 && (
                              <img
                                width="38"
                                height="38"
                                className="rounded bg-actionHover"
                                src={row.fields.Photo[0].url}
                                alt={row.fields.Name}
                              />
                            )}
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {row.fields.Name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell><Typography variant="body2">{row.fields.description}</Typography></TableCell>
                        <TableCell><Typography variant="body1">{row.fields.quantity}</Typography></TableCell>
                        <TableCell><Typography variant="body1">{row.fields.price}</Typography></TableCell>
                        <TableCell><Typography variant="body1">{row.fields.category}</Typography></TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleEdit(row.id)}
                            startIcon={<i className="ri-edit-box-line text-[22px] text-textSecondary"></i>}
                            sx={{ marginRight: 1 }}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            color="error"
                            onClick={() => handleDelete(row.id)}
                            startIcon={<i className="ri-delete-bin-line text-[22px] text-textSecondary"></i>}
                          >
                            Supprimer
                          </Button>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredProducts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesOverview;