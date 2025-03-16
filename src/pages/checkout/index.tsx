import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { useCart } from 'src/context/CartContext'; // Contexte du panier
import { useRouter } from 'next/navigation';
import ShareIcon from 'mdi-material-ui/ShareVariant'; // Icône pour partager
import DeleteIcon from 'mdi-material-ui/Delete'; // Icône pour supprimer
import Alert from '@mui/material/Alert';

const CheckoutPage = () => {
  const { cart, updateQuantity, removeFromCart } = useCart(); // Accès au panier
  const router = useRouter();

  // États pour l'adresse de livraison et le code promo
  const [deliveryInfo, setDeliveryInfo] = useState({
    contactName: '',
    phoneNumber: '',
    region: '',
    cityOrVillage: '',
    additionalDetails: '', // Instructions supplémentaires (ex: point de repère)
  });
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [shareLink, setShareLink] = useState('');

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
    const shareUrl = `${window.location.origin}/cart/shared?data=${cartData}`;
    setShareLink(shareUrl);
    navigator.clipboard.writeText(shareUrl);
    alert('Lien du panier copié dans le presse-papiers !');
  };

  // Gestion de la commande
  const handlePlaceOrder = () => {
    if (!deliveryInfo.contactName || !deliveryInfo.phoneNumber || !deliveryInfo.region) {
      alert('Veuillez remplir les informations de livraison obligatoires.');
      return;
    }
    // Logique pour envoyer la commande au backend (à implémenter selon votre API)
    console.log('Commande passée :', { cart, deliveryInfo, total });
    router.push('/order-confirmation'); // Redirection après succès (page à créer)
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
                label="Nom du contact"
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
                label="Région"
                value={deliveryInfo.region}
                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, region: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Ville ou village"
                value={deliveryInfo.cityOrVillage}
                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, cityOrVillage: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Instructions supplémentaires (ex: point de repère)"
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
                  Sous-total : {calculateSubtotal().toLocaleString('fr-FR')} F CFA
                </Typography>
                {promoApplied && (
                  <Typography variant="body1" color="success.main">
                    Réduction : -{discount.toLocaleString('fr-FR')} F CFA
                  </Typography>
                )}
                <Typography variant="h6">
                  Total : {total.toLocaleString('fr-FR')} F CFA
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handlePlaceOrder}
                startIcon={<i className="ri-check-line"></i>}
              >
                Passer la commande
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CheckoutPage;