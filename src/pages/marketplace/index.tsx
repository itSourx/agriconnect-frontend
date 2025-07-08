import { withAuth } from '@/components/auth/withAuth';
import React, { useEffect, useState } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import { styled, alpha } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Paper from '@mui/material/Paper';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from 'src/configs/constants';

// Styled components pour un design moderne
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.divider, 0.5),
    borderWidth: 1,
  },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.divider, 0.5),
    borderWidth: 1,
  },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
  },
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  borderRadius: 20,
  fontWeight: 500,
  '&.MuiChip-filled': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
    },
  },
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  boxShadow: 'none',
  border: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.3),
  borderRadius: 8,
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: '8px 0',
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  '& .MuiAccordionSummary-content': {
    margin: '12px 0',
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    color: theme.palette.primary.main,
  },
}));

// Types pour les produits
interface Product {
  id: string;
  fields: {
    Name: string;
    description?: string;
    price: number;
    mesure: string;
    quantity: number;
    category?: string;
    location?: string;
    userFirstName?: string[];
    userLastName?: string[];
    userId?: string[];
    user_id?: string[];
    user?: string[];
    farmerId?: string[];
    Gallery?: Array<{ url: string }>;
    Photo?: Array<{ url: string }>;
  };
}

// Fonction utilitaire pour formater les quantités
const formatQuantity = (quantity: number): string => {
  return quantity < 10 ? `0${quantity}` : quantity.toString()
}

const Marketplace = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = React.useState<string[]>([]);
  const [locationFilter, setLocationFilter] = React.useState<string[]>([]);
  const [vendorFilter, setVendorFilter] = React.useState<string[]>([]);
  const [sortOrder, setSortOrder] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [showFilters, setShowFilters] = React.useState(false);
  const { addToCart } = useCart(); // Utiliser le contexte pour ajouter au panier
  const router = useRouter();
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 100000]);
  const [addToCartLoading, setAddToCartLoading] = useState<{ [productId: string]: boolean }>({});

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/products`)
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        // Calculer la plage de prix - ne pas initialiser le max au prix maximum
        const prices = data.map((p: Product) => p.fields.price).filter(Boolean);
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          // Utiliser une valeur fixe pour le max au lieu du prix maximum
          setPriceRange([minPrice, 100000]);
        }
      })
      .catch((error) => console.error('Erreur lors de la récupération des produits:', error))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (categoryFilter.length > 0) {
      filtered = filtered.filter((product) => categoryFilter.includes(product.fields.category || ''));
    }
    if (locationFilter.length > 0) {
      filtered = filtered.filter((product) => locationFilter.includes(product.fields.location || ''));
    }
    if (vendorFilter.length > 0) {
      filtered = filtered.filter(
        (product) =>
          vendorFilter.includes(`${product.fields.userFirstName?.[0]} ${product.fields.userLastName?.[0]}`)
      );
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.fields.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.fields.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par prix
    filtered = filtered.filter((product) => {
      const price = product.fields.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (sortOrder === 'asc') {
      filtered.sort((a, b) => (a.fields.price || 0) - (b.fields.price || 0));
    } else if (sortOrder === 'desc') {
      filtered.sort((a, b) => (b.fields.price || 0) - (a.fields.price || 0));
    }

    setFilteredProducts(filtered);
  }, [categoryFilter, locationFilter, vendorFilter, sortOrder, searchQuery, products, priceRange]);

  const categories = [...new Set(products.map((p) => p.fields.category).filter((cat): cat is string => Boolean(cat)))];
  const locations = [...new Set(products.map((p) => p.fields.location).filter((loc): loc is string => Boolean(loc)))];
  const vendors = [
    ...new Set(
      products.map((p) => `${p.fields.userFirstName?.[0]} ${p.fields.userLastName?.[0]}`).filter((vendor): vendor is string => Boolean(vendor))
    ),
  ];

  const handleOpenFarmerModal = (farmerIdArray: string[] | string) => {
    const farmerIdArrayNormalized = Array.isArray(farmerIdArray) ? farmerIdArray : [farmerIdArray];
    const farmerId = farmerIdArrayNormalized[0];
    
    if (farmerId) {
      router.push(`/marketplace/farmer/${farmerId}`);
    }
  };

  const clearAllFilters = () => {
    setCategoryFilter([]);
    setLocationFilter([]);
    setVendorFilter([]);
    setSortOrder('');
    setSearchQuery('');
    const prices = products.map((p: Product) => p.fields.price).filter(Boolean);
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      // Utiliser une valeur fixe pour le max
      setPriceRange([minPrice, 100000]);
    }
  };

  const hasActiveFilters = categoryFilter.length > 0 || locationFilter.length > 0 || vendorFilter.length > 0 || sortOrder || searchQuery;

  const handleAddToCart = (product: Product) => {
    setAddToCartLoading(prev => ({ ...prev, [product.id]: true }));
    addToCart(product);
    toast.success('Produit ajouté au panier !');
    setTimeout(() => {
      setAddToCartLoading(prev => ({ ...prev, [product.id]: false }));
    }, 900);
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, width: '100%', px: 2 }}>

      {/* Layout principal avec sidebar et contenu */}
      <Grid container spacing={3} sx={{ maxWidth: '100%' }}>
        {/* Sidebar des filtres - Cachée sur mobile par défaut */}
        <Grid item xs={12} lg={2.5} sx={{ 
          display: { xs: showFilters ? 'block' : 'none', lg: 'block' }
        }}>
          {/* Header sticky pour mobile */}
          <Box sx={{
            display: { xs: 'flex', lg: 'none' },
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 2,
            py: 1,
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filtres
            </Typography>
            <IconButton aria-label="Fermer les filtres" onClick={() => setShowFilters(false)}>
              <ClearIcon />
            </IconButton>
          </Box>
          <Paper sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Filtres
              </Typography>
              {hasActiveFilters && (
                <Button
                  startIcon={<ClearIcon />}
                  onClick={clearAllFilters}
                  sx={{ ml: 'auto', textTransform: 'none' }}
                  size="small"
                >
                  Effacer
                </Button>
              )}
            </Box>

            {/* Filtre par prix */}
            <StyledAccordion defaultExpanded>
              <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Prix (F CFA)
                </Typography>
              </StyledAccordionSummary>
              <AccordionDetails>
                <Box sx={{ px: 1 }}>
                  <Slider
                    value={priceRange}
                    onChange={(event, newValue) => setPriceRange(newValue as [number, number])}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100000}
                    step={1000}
                    sx={{ mt: 2 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {priceRange[0].toLocaleString('fr-FR')} F CFA
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {priceRange[1].toLocaleString('fr-FR')} F CFA
                    </Typography>
                  </Box>
                </Box>
              </AccordionDetails>
            </StyledAccordion>

            {/* Filtre par catégorie */}
            <StyledAccordion defaultExpanded>
              <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Catégories
                </Typography>
              </StyledAccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={categoryFilter.length === 0}
                        onChange={() => setCategoryFilter([])}
                        size="small"
                      />
                    }
                    label="Toutes les catégories"
                  />
                  {categories.map(cat => (
                    <FormControlLabel
                      key={cat}
                      control={
                        <Checkbox
                          checked={categoryFilter.includes(cat)}
                          onChange={() => {
                            if (categoryFilter.includes(cat)) {
                              setCategoryFilter(categoryFilter.filter((c) => c !== cat));
                            } else {
                              setCategoryFilter([...categoryFilter, cat]);
                            }
                          }}
                          size="small"
                        />
                      }
                      label={cat}
                    />
                  ))}
                </Stack>
              </AccordionDetails>
            </StyledAccordion>

            {/* Filtre par localisation */}
            <StyledAccordion defaultExpanded>
              <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Localisation
                </Typography>
              </StyledAccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={locationFilter.length === 0}
                        onChange={() => setLocationFilter([])}
                        size="small"
                      />
                    }
                    label="Toutes les localisations"
                  />
                  {locations.map(loc => (
                    <FormControlLabel
                      key={loc}
                      control={
                        <Checkbox
                          checked={locationFilter.includes(loc)}
                          onChange={() => {
                            if (locationFilter.includes(loc)) {
                              setLocationFilter(locationFilter.filter((l) => l !== loc));
                            } else {
                              setLocationFilter([...locationFilter, loc]);
                            }
                          }}
                          size="small"
                        />
                      }
                      label={loc}
                    />
                  ))}
                </Stack>
              </AccordionDetails>
            </StyledAccordion>

            {/* Filtre par vendeur */}
            <StyledAccordion defaultExpanded>
              <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Vendeurs
                </Typography>
              </StyledAccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={vendorFilter.length === 0}
                        onChange={() => setVendorFilter([])}
                        size="small"
                      />
                    }
                    label="Tous les vendeurs"
                  />
                  {vendors.map(vendor => (
                    <FormControlLabel
                      key={vendor}
                      control={
                        <Checkbox
                          checked={vendorFilter.includes(vendor)}
                          onChange={() => {
                            if (vendorFilter.includes(vendor)) {
                              setVendorFilter(vendorFilter.filter((v) => v !== vendor));
                            } else {
                              setVendorFilter([...vendorFilter, vendor]);
                            }
                          }}
                          size="small"
                        />
                      }
                      label={vendor}
                    />
                  ))}
                </Stack>
              </AccordionDetails>
            </StyledAccordion>
          </Paper>
        </Grid>

        {/* Contenu principal */}
        <Grid item xs={12} lg={9.5}>
          {/* Barre d'outils avec recherche et tri sur la même ligne */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              {/* Bouton de filtres visible uniquement sur mobile */}
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ 
                  display: { xs: 'flex', lg: 'none' },
                  textTransform: 'none',
                  borderRadius: 2
                }}
              >
                {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
              </Button>
              
              {/* Barre de recherche */}
              <StyledTextField
                placeholder="Rechercher un produit..."
                variant="outlined"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                sx={{ flex: 1, maxWidth: 400 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              {hasActiveFilters && (
                <Typography variant="body2" color="text.secondary">
                  Résultats filtrés
                </Typography>
              )}
            </Box>
            
            <StyledFormControl sx={{ minWidth: 200 }}>
              <InputLabel id="sort-select">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SortIcon sx={{ mr: 1, fontSize: 20 }} />
                  Trier par
                </Box>
              </InputLabel>
              <Select
                labelId="sort-select"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                input={<OutlinedInput label="Trier par" />}
              >
                <MenuItem value="">Pertinence</MenuItem>
                <MenuItem value="asc">Prix croissant</MenuItem>
                <MenuItem value="desc">Prix décroissant</MenuItem>
              </Select>
            </StyledFormControl>
          </Box>

          {/* Filtres actifs */}
          {hasActiveFilters && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Filtres actifs :
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {categoryFilter.map(cat => (
                  <FilterChip
                    key={cat}
                    label={`Catégorie: ${cat}`}
                    onDelete={() => setCategoryFilter(categoryFilter.filter((c) => c !== cat))}
                    size="small"
                  />
                ))}
                {locationFilter.map(loc => (
                  <FilterChip
                    key={loc}
                    label={`Localisation: ${loc}`}
                    onDelete={() => setLocationFilter(locationFilter.filter((l) => l !== loc))}
                    size="small"
                  />
                ))}
                {vendorFilter.map(vendor => (
                  <FilterChip
                    key={vendor}
                    label={`Vendeur: ${vendor}`}
                    onDelete={() => setVendorFilter(vendorFilter.filter((v) => v !== vendor))}
                    size="small"
                  />
                ))}
                {sortOrder && (
                  <FilterChip
                    label={`Tri: ${sortOrder === 'asc' ? 'Prix croissant' : 'Prix décroissant'}`}
                    onDelete={() => setSortOrder('')}
                    size="small"
                  />
                )}
                {searchQuery && (
                  <FilterChip
                    label={`Recherche: "${searchQuery}"`}
                    onDelete={() => setSearchQuery('')}
                    size="small"
                  />
                )}
              </Stack>
            </Box>
          )}

          {/* Grille des produits */}
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
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={product.id}>
                  <StyledCard sx={{ 
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
                    {product.fields.Gallery && product.fields.Gallery.length > 0 ? (
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
                    ) : product.fields.Photo && product.fields.Photo.length > 0 ? (
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
                            Plus que {formatQuantity(product.fields.quantity)} {product.fields.mesure}
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
                              onClick={() => {
                                const farmerId = product.fields.userId || product.fields.user_id || product.fields.user || product.fields.farmerId;
                                if (farmerId && (typeof farmerId === 'string' || Array.isArray(farmerId))) {
                                  handleOpenFarmerModal(farmerId);
                                }
                              }}
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
                        onClick={() => handleAddToCart(product)}
                        startIcon={<i className="ri-shopping-cart-line"></i>}
                        size="small"
                        disabled={!!addToCartLoading[product.id]}
                        sx={{
                          transition: 'transform 0.2s, background 0.2s',
                          transform: addToCartLoading[product.id] ? 'scale(1.08)' : 'none',
                          background: addToCartLoading[product.id] ? 'linear-gradient(90deg, #43a047 0%, #388e3c 100%)' : undefined,
                          pointerEvents: addToCartLoading[product.id] ? 'none' : 'auto',
                        }}
                      >
                        {addToCartLoading[product.id] ? 'En cours...' : 'Ajouter au panier'}
                      </Button>
                    </Box>
                  </StyledCard>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  px: 3
                }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                    Aucun produit trouvé
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {hasActiveFilters 
                      ? 'Essayez de modifier vos filtres ou votre recherche'
                      : 'Aucun produit disponible pour le moment.'
                    }
                  </Typography>
                  {hasActiveFilters && (
                    <Button
                      variant="outlined"
                      onClick={clearAllFilters}
                      startIcon={<ClearIcon />}
                    >
                      Effacer tous les filtres
                    </Button>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default withAuth(Marketplace);