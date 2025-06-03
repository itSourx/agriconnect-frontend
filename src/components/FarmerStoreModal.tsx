import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useCart } from 'src/context/CartContext';
import { toast } from 'react-hot-toast';

interface FarmerStoreModalProps {
  open: boolean;
  onClose: () => void;
  farmerId: string | null;
  products: any[]; // Products passed from Marketplace
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
  };
}

const FarmerStoreModal: React.FC<FarmerStoreModalProps> = ({ open, onClose, farmerId, products = [] }) => {
    const [farmer, setFarmer] = useState<Farmer | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { addToCart } = useCart();
  
    useEffect(() => {
      if (!open || !farmerId) return;
      setLoading(true);
      setError('');
      setFarmer(null);
  
      // Fetch only farmer details
      fetch(`https://agriconnect-bc17856a61b8.herokuapp.com/users/${farmerId}`)
        .then((res) => res.json())
        .then((data) => {
          setFarmer(data);
        })
        .catch(() => setError("Erreur lors du chargement de l'agriculteur."))
        .finally(() => setLoading(false));
    }, [open, farmerId]);
  
    const handleAddToCart = (product: any) => {
      addToCart(product);
      toast.success('Produit ajouté au panier !');
    };
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        {/* Bannière */}
        <Box
          sx={{
            height: 120,
            background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            px: 4,
            pt: 2,
            pb: 3,
          }}
        >
          <Avatar
            src={farmer?.fields?.Photo?.[0]?.url}
            sx={{
              width: 72,
              height: 72,
              border: '3px solid #fff',
              boxShadow: 2,
              position: 'absolute',
              top: 60,
              left: 32,
            }}
          />
          <Box sx={{ ml: 12, color: '#fff', zIndex: 1 }}>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#fff' }}>
              {farmer?.fields?.name ||
                (farmer?.fields?.FirstName || '') + ' ' + (farmer?.fields?.LastName || '')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#e3f2fd' }}>
              {farmer?.fields?.email}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: '#fff',
              bgcolor: 'rgba(0,0,0,0.15)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.25)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ pt: 8 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : farmer ? (
            <>
              <Box display="flex" alignItems="center" gap={2} mb={2} mt={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {farmer.fields?.Phone || 'Non précisé'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {farmer.fields?.Address || 'Non précisé'}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Ses produits :
              </Typography>
              <Grid container spacing={2}>
                {products.length > 0 ? (
                  products.map((product, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id || idx}>
                      <Card
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
                        }}
                      >
                        {product.fields?.Gallery?.length > 0 ? (
                          <CardMedia
                            component="img"
                            height="140"
                            image={product.fields.Gallery[0].url}
                            alt={product.fields.Name}
                            sx={{ objectFit: 'cover' }}
                          />
                        ) : product.fields?.Photo?.length > 0 ? (
                          <CardMedia
                            component="img"
                            height="140"
                            image={product.fields.Photo[0].url}
                            alt={product.fields.Name}
                            sx={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 140,
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
                          <Typography
                            variant="subtitle1"
                            gutterBottom
                            sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                          >
                            {product.fields?.Name || 'Produit inconnu'}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {product.fields?.description || '-'}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{ color: 'primary.main', fontWeight: 'bold' }}
                          >
                            {product.fields?.price
                              ? `${product.fields.price.toLocaleString('fr-FR')} F CFA / ${product.fields.mesure}`
                              : 'Prix non disponible'}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                            <Chip
                              icon={<InventoryIcon />}
                              label={
                                product.fields?.quantity
                                  ? `${product.fields.quantity} ${product.fields.mesure}`
                                  : 'Stock non disponible'
                              }
                              size="small"
                              color="primary"
                              variant="outlined"
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
                          >
                            Ajouter au panier
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Aucun produit trouvé pour cet agriculteur.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    );
  };
  
export default FarmerStoreModal; 