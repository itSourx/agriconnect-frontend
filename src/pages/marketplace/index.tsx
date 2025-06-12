import { withAuth } from '@/components/auth/withAuth';
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
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import FarmerStoreModal from '@/components/FarmerStoreModal';
import CircularProgress from '@mui/material/CircularProgress';

const Marketplace = () => {
  const [products, setProducts] = React.useState([]);
  const [filteredProducts, setFilteredProducts] = React.useState([]);
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [locationFilter, setLocationFilter] = React.useState('');
  const [vendorFilter, setVendorFilter] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const { addToCart } = useCart(); // Utiliser le contexte pour ajouter au panier
  const router = useRouter();
  const [openFarmerModal, setOpenFarmerModal] = React.useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = React.useState(null);
  const [farmerProducts, setFarmerProducts] = React.useState([]);

  useEffect(() => {
    setIsLoading(true);
    fetch('https://agriconnect-bc17856a61b8.herokuapp.com/products')
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch((error) => console.error('Erreur lors de la récupération des produits:', error))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (categoryFilter) {
      filtered = filtered.filter((product) => product.fields.category === categoryFilter);
    }
    if (locationFilter) {
      filtered = filtered.filter((product) => product.fields.location === locationFilter);
    }
    if (vendorFilter) {
      filtered = filtered.filter(
        (product) =>
          `${product.fields.userFirstName?.[0]} ${product.fields.userLastName?.[0]}` === vendorFilter
      );
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
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

  const categories = [...new Set(products.map((p) => p.fields.category).filter(Boolean))];
  const locations = [...new Set(products.map((p) => p.fields.location).filter(Boolean))];
  const vendors = [
    ...new Set(
      products.map((p) => `${p.fields.userFirstName?.[0]} ${p.fields.userLastName?.[0]}`).filter(Boolean)
    ),
  ];

  const handleOpenFarmerModal = (farmerIdArray) => {
    console.log('Farmer ID:', farmerIdArray);
    console.log('All Products:', products);
  

    const farmerProducts = products.filter((product) => {
      const userField = product.fields.user;
      return (
        Array.isArray(userField) &&
        farmerIdArray.some((id) => userField.includes(id))
      );
    });
  
    console.log('Filtered Farmer Products:', farmerProducts);
  
    setSelectedFarmerId(farmerIdArray);
    setFarmerProducts(farmerProducts);
    setOpenFarmerModal(true);
  };

  const handleCloseFarmerModal = () => {
    setOpenFarmerModal(false);
    setSelectedFarmerId(null);
    setFarmerProducts([]);
  };

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
          <Grid container spacing={3}>
            {isLoading ? (
              <Grid item xs={12} sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '400px'
              }}>
                <CircularProgress 
                  size={60} 
                  thickness={4}
                  sx={{
                    color: 'primary.main',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(1)',
                        opacity: 1
                      },
                      '50%': {
                        transform: 'scale(1.1)',
                        opacity: 0.7
                      },
                      '100%': {
                        transform: 'scale(1)',
                        opacity: 1
                      }
                    }
                  }}
                />
              </Grid>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <Grid item xs={12} sm={6} md={2.4} key={product.id}>
                  <Card sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%',
                    transition: 'transform 0.2s',
                    borderRadius: '16px',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}>
                    {product.fields.Gallery?.length > 0 ? (
                      <Carousel autoPlay={false} navButtonsAlwaysVisible sx={{ height: 160 }}>
                        {product.fields.Gallery.map((image, index) => (
                          <CardMedia
                            key={index}
                            component="img"
                            height="160"
                            image={image.url}
                            alt={`${product.fields.Name} - ${index + 1}`}
                            sx={{ objectFit: 'cover' }}
                          />
                        ))}
                      </Carousel>
                    ) : product.fields.Photo?.length > 0 ? (
                      <CardMedia
                        component="img"
                        height="160"
                        image={product.fields.Photo[0].url}
                        alt={product.fields.Name}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 160,
                          bgcolor: 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography color="text.secondary">Pas d'image</Typography>
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        {product.fields.Name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {product.fields.description || '-'}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        {product.fields.price?.toLocaleString('fr-FR')} F CFA / {product.fields.mesure}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                        {product.fields.quantity < 50 && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'error.main',
                              fontWeight: 500,
                              display: 'block',
                              width: '100%',
                              mb: 1
                            }}
                          >
                            Plus que {product.fields.quantity} {product.fields.mesure}
                          </Typography>
                        )}
                        <Chip
                          icon={<LocationOnIcon />}
                          label={product.fields.location || 'Non précisée'}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                        <Chip
                          icon={<PersonIcon />}
                          label={
                            <Box
                              component="span"
                              sx={{
                                paddingRight: '8px',
                                color: '#1976d2',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-block',
                              }}
                              onClick={() => handleOpenFarmerModal(product.fields.userId || product.fields.user_id || product.fields.user || product.fields.farmerId)}
                            >
                              {`${product.fields.userFirstName?.[0]} ${product.fields.userLastName?.[0]}`}
                            </Box>
                          }
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{
                            '& .MuiChip-icon': {
                              color: '#1976d2',
                              margin: 0,
                              padding: '4px',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center'
                            },
                            '& .MuiChip-label': {
                              padding: 0
                            },
                            bgcolor: '#e3f2fd',
                            border: 'none',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              bgcolor: '#90caf9 !important',
                              '& .MuiChip-icon, & .MuiChip-label': {
                                color: '#1976d2'
                              }
                            }
                          }}
                        />
                      </Stack>
                    </CardContent>
                    <Box sx={{ p: 1.5 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => addToCart(product)}
                        startIcon={<i className="ri-shopping-cart-line"></i>}
                        size="small"
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
      <FarmerStoreModal
        open={openFarmerModal}
        onClose={handleCloseFarmerModal}
        farmerId={selectedFarmerId}
        products={farmerProducts}
      />
    </Box>
  );
};

export default withAuth(Marketplace);