import React, { useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useRouter } from 'next/navigation';
import CardMedia from '@mui/material/CardMedia';
import Carousel from 'react-material-ui-carousel';
import Divider from '@mui/material/Divider';
import { useCart } from 'src/context/CartContext'; // Importer le contexte

const Marketplace = () => {
  const [products, setProducts] = React.useState([]);
  const [filteredProducts, setFilteredProducts] = React.useState([]);
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [locationFilter, setLocationFilter] = React.useState('');
  const [vendorFilter, setVendorFilter] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const { addToCart } = useCart(); // Utiliser le contexte pour ajouter au panier
  const router = useRouter();

  useEffect(() => {
    fetch('https://agriconnect-bc17856a61b8.herokuapp.com/products')
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch(error => console.error('Erreur lors de la récupération des produits:', error));
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (categoryFilter) {
      filtered = filtered.filter(product => product.fields.category === categoryFilter);
    }
    if (locationFilter) {
      filtered = filtered.filter(product => product.fields.location === locationFilter);
    }
    if (vendorFilter) {
      filtered = filtered.filter(
        product => `${product.fields.userFirstName?.[0]} ${product.fields.userLastName?.[0]}` === vendorFilter
      );
    }
    if (searchQuery) {
      filtered = filtered.filter(
        product =>
          product.fields.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.fields.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortOrder === 'asc') {
      filtered.sort((a, b) => (a.fields.price || 0) - (b.fields.price || 0));
    } else if (sortOrder === 'desc') {
      filtered.sort((a, b) => (b.fields.price || 0) - (a.fields.price || 0));
    }

    setFilteredProducts(filtered);
  }, [categoryFilter, locationFilter, vendorFilter, sortOrder, searchQuery, products]);

  const categories = [...new Set(products.map(p => p.fields.category).filter(Boolean))];
  const locations = [...new Set(products.map(p => p.fields.location).filter(Boolean))];
  const vendors = [
    ...new Set(products.map(p => `${p.fields.userFirstName?.[0]} ${p.fields.userLastName?.[0]}`).filter(Boolean)),
  ];

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Marketplace - Achetez des produits locaux" />
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={3}>
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
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="location-select">Localisation</InputLabel>
                    <Select
                      labelId="location-select"
                      value={locationFilter}
                      onChange={e => setLocationFilter(e.target.value)}
                      input={<OutlinedInput label="Localisation" />}
                    >
                      <MenuItem value="">Toutes</MenuItem>
                      {locations.map(loc => (
                        <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="vendor-select">Vendeur</InputLabel>
                    <Select
                      labelId="vendor-select"
                      value={vendorFilter}
                      onChange={e => setVendorFilter(e.target.value)}
                      input={<OutlinedInput label="Vendeur" />}
                    >
                      <MenuItem value="">Tous</MenuItem>
                      {vendors.map(vendor => (
                        <MenuItem key={vendor} value={vendor}>{vendor}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="sort-select">Trier par prix</InputLabel>
                    <Select
                      labelId="sort-select"
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value)}
                      input={<OutlinedInput label="Trier par prix" />}
                    >
                      <MenuItem value="">Aucun tri</MenuItem>
                      <MenuItem value="asc">Croissant</MenuItem>
                      <MenuItem value="desc">Décroissant</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Rechercher un produit (nom, description)"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={4}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {product.fields.Gallery?.length > 0 ? (
                      <Carousel autoPlay={false} navButtonsAlwaysVisible sx={{ height: 200 }}>
                        {product.fields.Gallery.map((image, index) => (
                          <CardMedia
                            key={index}
                            component="img"
                            height="200"
                            image={image.url}
                            alt={`${product.fields.Name} - ${index + 1}`}
                            sx={{ objectFit: 'cover' }}
                          />
                        ))}
                      </Carousel>
                    ) : product.fields.Photo?.length > 0 ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.fields.Photo[0].url}
                        alt={product.fields.Name}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          bgcolor: 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography color="text.secondary">Pas d'image</Typography>
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {product.fields.Name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.fields.description || 'Pas de description disponible'}
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 1, color: 'primary.main' }}>
                        <strong>
                          {product.fields.price?.toLocaleString('fr-FR')} F CFA / {product.fields.mesure}
                        </strong>
                      </Typography>
                      <Typography variant="body1">
                        <strong>Quantité restante :</strong> {product.fields.quantity} {product.fields.mesure}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Localisation :</strong> {product.fields.location || 'Non précisée'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Vendeur :</strong> {product.fields.userFirstName?.[0]}{' '}
                        {product.fields.userLastName?.[0]}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => addToCart(product)}
                        startIcon={<i className="ri-shopping-cart-line"></i>}
                      >
                        Ajouter au panier
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" align="center">
                  Aucun produit disponible pour le moment.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Marketplace;