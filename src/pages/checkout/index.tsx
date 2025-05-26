import { withAuth } from '@/components/auth/withAuth';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { useCart } from '@/context/CartContext'; // Contexte du panier
import { useRouter } from 'next/navigation';
import ShareIcon from 'mdi-material-ui/ShareVariant'; // Icône pour partager
import DeleteIcon from 'mdi-material-ui/Delete'; // Icône pour supprimer
import Alert from '@mui/material/Alert';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import api from 'src/api/axiosConfig';
import CircularProgress from '@mui/material/CircularProgress';

interface UserProfile {
  id: string;
  FirstName: string;
  LastName: string;
  email: string;
  Phone: string | null;
  Address: string | null;
  profileType: string;
  accessToken?: string;
}

interface CustomSession {
  user: UserProfile;
  expires: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderData {
  products: Array<{
    id: string;
    quantity: number;
  }>;
}

const CheckoutPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart(); // Accès au panier
  const router = useRouter();
  const { data: session } = useSession();
  const customSession = session as CustomSession;
  const user = customSession?.user;

  // États pour l'adresse de livraison
  const [deliveryInfo, setDeliveryInfo] = useState({
    contactName: '',
    phoneNumber: '',
    address: '',
    cityOrVillage: '',
    additionalDetails: '',
  });
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [shareLink, setShareLink] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pré-remplir les informations de l'utilisateur
  useEffect(() => {
    if (user) {
      setDeliveryInfo({
        contactName: `${user.FirstName} ${user.LastName}`,
        phoneNumber: user.Phone || '',
        address: user.Address || '',
        cityOrVillage: '',
        additionalDetails: '',
      });
    }
  }, [user]);

  // Calcul du total
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.fields.price * item.quantity, 0);
  };
  const total = promoApplied ? calculateSubtotal() - discount : calculateSubtotal();

  // Gestion de la quantité
  const handleQuantityChange = (productId: string, value: number) => {
    const maxQuantity = cart.find(item => item.id === productId)?.fields.quantity || 1;
    const newQuantity = Math.max(1, Math.min(value, maxQuantity));
    updateQuantity(productId, newQuantity);
  };

  // Gestion du code promo (exemple simple)
  const applyPromoCode = () => {
    if (promoCode === 'SAVE10') { // Exemple de code promo
      setDiscount(calculateSubtotal() * 0.1); // 10% de réduction
      setPromoApplied(true);
    } else {
      setPromoApplied(false);
      setDiscount(0);
      alert('Code promo invalide');
    }
  };

  // Gestion du partage du panier
  const handleShareCart = () => {
    const cartData = encodeURIComponent(JSON.stringify(cart.map(item => ({
      id: item.id,
      name: item.fields.Name,
      quantity: item.quantity,
      price: item.fields.price,
    }))));
    const shareUrl = `${window.location.origin}/checkout/shared?data=${cartData}`;
    setShareLink(shareUrl);
    navigator.clipboard.writeText(shareUrl);
    alert('Lien du panier copié dans le presse-papiers !');
  };

  // Fonction pour ouvrir la modale de paiement
  const handleOpenPaymentDialog = () => {
    if (!deliveryInfo.contactName || !deliveryInfo.phoneNumber || !deliveryInfo.address) {
      toast.error('Veuillez remplir toutes les informations de livraison obligatoires');
      return;
    }
    setPaymentDialogOpen(true);
  };

  // Fonction pour fermer la modale de paiement
  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedPaymentMethod('');
  };

  // Fonction pour gérer le changement de méthode de paiement
  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPaymentMethod(event.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = session?.accessToken;
      if (!token) {
        toast.error('Vous devez être connecté pour passer une commande');
        return;
      }

      const orderData: OrderData = {
        products: cart.map(item => ({
          id: item.id,
          quantity: item.quantity
        }))
      };

      const response = await api.post(
        'https://agriconnect-bc17856a61b8.herokuapp.com/orders',
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success('Commande passée avec succès');
        clearCart();
        router.push('/marketplace');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la création de la commande';
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" align="center">
          Votre panier est vide. Retournez à la <a href="/marketplace">Marketplace</a> pour ajouter des produits.
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Finaliser votre commande
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Votre panier ({cart.length} article(s))</Typography>
              </Box>
              
              {cart.map(item => (
                <Box key={item.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">
                        <strong>{item.fields.Name}</strong>
                      </Typography>
                      <Typography variant="body2">
                        Prix unitaire : {item.fields.price.toLocaleString('fr-FR')} F CFA / {item.fields.mesure}
                      </Typography>
                      <Typography variant="body2">
                        Quantité disponible : {item.fields.quantity} {item.fields.mesure}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1, max: item.fields.quantity }}
                        size="small"
                        sx={{ width: 80 }}
                      />
                      <IconButton color="error" onClick={() => removeFromCart(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Sous-total : {(item.fields.price * item.quantity).toLocaleString('fr-FR')} F CFA
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Informations de livraison et total */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations de livraison
              </Typography>
              <TextField
                fullWidth
                label="Nom complet"
                value={deliveryInfo.contactName}
                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, contactName: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Numéro de téléphone"
                value={deliveryInfo.phoneNumber}
                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phoneNumber: e.target.value })}
                type="tel"
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Adresse de livraison"
                value={deliveryInfo.address}
                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Ville"
                value={deliveryInfo.cityOrVillage}
                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, cityOrVillage: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Instructions supplémentaires"
                value={deliveryInfo.additionalDetails}
                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, additionalDetails: e.target.value })}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Code promotionnel
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Entrez votre code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <Button variant="outlined" onClick={applyPromoCode}>
                  Appliquer
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Résumé de la commande
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  Total : {calculateSubtotal().toLocaleString('fr-FR')} F CFA
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleOpenPaymentDialog}
                startIcon={<i className="ri-check-line"></i>}
              >
                {isLoading ? 'Traitement...' : 'Passer la commande'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modale de paiement */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Choisir le mode de paiement</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Méthodes de paiement disponibles</FormLabel>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <FormControlLabel 
                  value="mobile_money" 
                  control={<Radio />} 
                  label="Mobile Money (Bientôt disponible)" 
                  disabled 
                />
                <FormControlLabel 
                  value="card" 
                  control={<Radio />} 
                  label="Carte bancaire (Bientôt disponible)" 
                  disabled 
                />
                <FormControlLabel 
                  value="skip" 
                  control={<Radio />} 
                  label="Passer le paiement pour le moment" 
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog} color="inherit">
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={selectedPaymentMethod !== 'skip' || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Traitement...' : 'Confirmer la commande'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default withAuth(CheckoutPage);