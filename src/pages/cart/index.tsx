import React from 'react';
import { useCart } from '@/context/CartContext'; // Assurez-vous que le chemin est correct
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import DeleteIcon from '@mui/icons-material/Delete';
import EmptyState from '@/components/EmptyState';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const handleQuantityChange = (id: string, value: number) => {
    updateQuantity(id, value);
  };

  const handleRemoveFromCart = (id: string) => {
    removeFromCart(id);
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      console.log('Finaliser l\'achat');
    }
  };

  if (cart.length === 0) {
    return (
      <EmptyState
        title="Votre panier est vide"
        description="Explorez notre marketplace pour découvrir des produits locaux de qualité"
        image="/images/empty-cart.svg"
        buttonText="Explorer la marketplace"
        buttonLink="/marketplace"
      />
    );
  }

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Card>
        <CardHeader title='Votre panier' />
        <CardContent>
          {cart.map(item => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant='body1'>
                  <strong>{item.fields.Name}</strong> - {item.fields.price.toLocaleString('fr-FR')} F CFA
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  type='number'
                  value={item.quantity}
                  onChange={e => handleQuantityChange(item.id, parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                  size='small'
                  sx={{ width: 80 }}
                />
                <IconButton
                  edge='end'
                  aria-label='delete'
                  onClick={() => handleRemoveFromCart(item.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant='contained'
              color='primary'
              onClick={handleCheckout}
            >
              Valider le panier
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CartPage;
