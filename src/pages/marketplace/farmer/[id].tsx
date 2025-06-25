import { withAuth } from '@/components/auth/withAuth';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Stack,
  Divider,
  Paper,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Breadcrumbs,
  Link,
  Alert,
  Skeleton
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Storefront,
  ShoppingCart,
  ArrowBack,
  LocalShipping,
  Verified,
  CalendarToday,
  Inventory,
  TrendingUp,
  Category
} from '@mui/icons-material';
import { useCart } from 'src/context/CartContext';
import { toast } from 'react-hot-toast';
import { styled, alpha } from '@mui/material/styles';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
  color: 'white',
  position: 'relative',
  padding: '40px 0'
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: 'white',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
  }
}));

const ProductCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
  }
}));

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
    user?: string[];
    Gallery?: Array<{ url: string }>;
    Photo?: Array<{ url: string }>;
  };
}

interface Farmer {
  id: string;
  fields?: {
    Photo?: { url: string }[];
    name?: string;
    FirstName?: string;
    LastName?: string;
    email?: string;
    Phone?: string;
    Address?: string;
    description?: string;
    joinDate?: string;
  };
}

const FarmerStorePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;

    const fetchFarmerData = async () => {
      setLoading(true);
      setError('');

      try {
        // Fetch farmer details
        const farmerResponse = await fetch(`https://agriconnect-bc17856a61b8.herokuapp.com/users/${id}`);
        const farmerData = await farmerResponse.json();
        setFarmer(farmerData);

        // Fetch all products and filter by farmer
        const productsResponse = await fetch('https://agriconnect-bc17856a61b8.herokuapp.com/products');
        const allProducts = await productsResponse.json();
        
        const farmerProducts = allProducts.filter((product: Product) => {
          const userField = product.fields.user;
          return Array.isArray(userField) && userField.includes(id as string);
        });
        
        setProducts(farmerProducts);
      } catch (err) {
        setError("Erreur lors du chargement des données du marchand.");
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerData();
  }, [id]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success('Produit ajouté au panier !');
  };

  const handleBackToMarketplace = () => {
    router.push('/marketplace');
  };

  const farmerName = farmer?.fields?.name || 
    `${farmer?.fields?.FirstName || ''} ${farmer?.fields?.LastName || ''}`.trim();

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.fields.price || 0), 0);
  const categories = [...new Set(products.map(p => p.fields.category).filter(Boolean))];

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <HeroSection>
          <Container maxWidth="xl">
            <Skeleton variant="rectangular" width="100%" height={200} />
          </Container>
        </HeroSection>
        <Container maxWidth="xl" sx={{ mt: -4, mb: 4 }}>
          <Skeleton variant="circular" width={100} height={100} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" height={24} />
        </Container>
      </Box>
    );
  }

  if (error || !farmer) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || "Marchand non trouvé"}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackToMarketplace}
          variant="outlined"
        >
          Retour à la marketplace
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Header with back button */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleBackToMarketplace}
              sx={{ color: 'text.secondary' }}
            >
              <ArrowBack />
            </IconButton>
            <Breadcrumbs>
              <Link href="/marketplace" color="text.secondary" underline="hover">
                Marketplace
              </Link>
              <Typography color="text.primary">{farmerName}</Typography>
            </Breadcrumbs>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item>
              <Avatar
                src={farmer.fields?.Photo?.[0]?.url}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid white',
                  boxShadow: 3,
                  bgcolor: 'primary.main'
                }}
              />
            </Grid>
            <Grid item xs>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h3" fontWeight={700} sx={{ color: 'white' }}>
                  {farmerName}
                </Typography>
                <Verified sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.95)', mb: 2, fontWeight: 500 }}>
                Agriculteur certifié
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  icon={<LocalShipping />}
                  label="Livraison rapide"
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)'
                    }
                  }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      <Container maxWidth="xl" sx={{ mt: -6, mb: 6 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard>
              <Inventory sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {totalProducts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Produits disponibles
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" fontWeight={700} color="success.main">
                {totalValue.toLocaleString('fr-FR')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                F CFA de valeur
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard>
              <Category sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
              <Typography variant="h4" fontWeight={700} color="info.main">
                {categories.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Catégories
              </Typography>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Left Column - Info */}
          <Grid item xs={12} lg={3}>
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Informations du marchand
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Email color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={farmer.fields?.email || 'Non disponible'}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Phone color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Téléphone"
                    secondary={farmer.fields?.Phone || 'Non disponible'}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <LocationOn color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Adresse"
                    secondary={farmer.fields?.Address || 'Non disponible'}
                  />
                </ListItem>
                
              </List>
            </Paper>
          </Grid>

          {/* Right Column - Products */}
          <Grid item xs={12} lg={9}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>

              {products.length > 0 ? (
                <Grid container spacing={3}>
                  {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <ProductCard>
                        {product.fields.Gallery && product.fields.Gallery.length > 0 ? (
                          <CardMedia
                            component="img"
                            height="200"
                            image={product.fields.Gallery[0].url}
                            alt={product.fields.Name}
                            sx={{ objectFit: 'cover' }}
                          />
                        ) : product.fields.Photo && product.fields.Photo.length > 0 ? (
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
                        
                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            {product.fields.Name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {product.fields.description || '-'}
                          </Typography>
                          
                          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
                            {product.fields.price?.toLocaleString('fr-FR')} F CFA
                          </Typography>
                          
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip
                              label={`${product.fields.quantity} ${product.fields.mesure}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            {product.fields.category && (
                              <Chip
                                label={product.fields.category}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </CardContent>
                        
                        <Box sx={{ p: 2, pt: 0 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => handleAddToCart(product)}
                            startIcon={<ShoppingCart />}
                            size="large"
                          >
                            Ajouter au panier
                          </Button>
                        </Box>
                      </ProductCard>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Storefront sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Aucun produit disponible
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ce marchand n'a pas encore ajouté de produits.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default withAuth(FarmerStorePage); 