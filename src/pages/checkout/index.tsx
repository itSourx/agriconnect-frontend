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
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import StoreIcon from '@mui/icons-material/Store';
import PaidIcon from '@mui/icons-material/Paid';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VpnKeyIcon from '@mui/icons-material/VpnKey';


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

interface SuperAdminResponse {
  compteAdmin: number;
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
  const [paymentStep, setPaymentStep] = useState<'initial' | 'otp'>('initial');
  const [otpCode, setOtpCode] = useState('');
  const [operationId, setOperationId] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [otpTimer, setOtpTimer] = useState(120); // 2 minutes en secondes
  const [canResendOtp, setCanResendOtp] = useState(false);

  // État pour suivre les erreurs de quantité
  const [quantityErrors, setQuantityErrors] = useState<{ [key: string]: boolean }>({});

  // Calcul du total
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.fields.price * item.quantity, 0);
  };

  // Nouveaux états pour le formulaire de paiement
  const [paymentForm, setPaymentForm] = useState({
    client_numero_compte: '',
    marchand_numero_compte: '',
    montant: (calculateSubtotal() * 1.18 - (promoApplied ? discount : 0)),
    motif: 'Paiement de produits',
    pin: ''
  });

  // Récupérer le numéro de compte du superadmin
  useEffect(() => {
    const fetchSuperAdminAccount = async () => {
      try {
        const response = await api.get<SuperAdminResponse>('https://agriconnect-bc17856a61b8.herokuapp.com/users/superadmin');
        if (response.data?.compteAdmin) {
          setPaymentForm(prev => ({
            ...prev,
            marchand_numero_compte: response.data.compteAdmin.toString()
          }));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du compte admin:', error);
        toast.error('Erreur lors de la récupération du compte marchand');
      }
    };

    fetchSuperAdminAccount();
  }, []);

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
  const total = promoApplied ? calculateSubtotal() - discount : calculateSubtotal();

  // Gestion de la quantité
  const handleQuantityChange = (productId: string, value: number) => {
    const maxQuantity = cart.find(item => item.id === productId)?.fields.quantity || 1;
    const newQuantity = Math.max(1, Math.min(value, maxQuantity));
    updateQuantity(productId, newQuantity);
  };

  // Vérification de la quantité lors du changement
  const validateQuantity = (productId: string, value: number) => {
    const maxQuantity = cart.find(item => item.id === productId)?.fields.quantity || 1;
    setQuantityErrors(prev => ({
      ...prev,
      [productId]: value > maxQuantity
    }));
    handleQuantityChange(productId, value);
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

  // Vérification si une quantité est invalide
  const hasInvalidQuantity = Object.values(quantityErrors).some(error => error);

  // Timer pour l'OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentStep === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [paymentStep, otpTimer]);

  // Mettre à jour le montant si le panier change
  useEffect(() => {
    setPaymentForm(prev => ({
      ...prev,
      montant: (calculateSubtotal() * 1.18 - (promoApplied ? discount : 0))
    }));
  }, [cart, promoApplied, discount]);

  // Gestion des changements de champ du formulaire de paiement
  const handlePaymentFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  // Fonction pour initier le paiement
  const initiatePayment = async () => {
    setIsLoading(true);
    setPaymentError('');
    const toastId = toast.loading('Paiement en cours...');
    try {
      // 1. D'abord faire le paiement OwoPay
      const response = await api.post('https://owomobile-1c888c91ddc9.herokuapp.com/transactions/payment', {
        client_numero_compte: paymentForm.client_numero_compte,
        marchand_numero_compte: paymentForm.marchand_numero_compte,
        montant: paymentForm.montant,
        motif: paymentForm.motif,
        pin: paymentForm.pin
      });
      const data = response.data as any;
      const opId = data.operationId || data.OperationId;
      const transactionId = data.transaction_id;

      if (opId) {
        setOperationId(opId);
        setPaymentStep('otp');
        setOtpTimer(120);
        setCanResendOtp(false);
        toast.success(data.message || 'Paiement initialisé, vérifiez votre email pour le code.', { id: toastId });
      }
    } catch (error: any) {
      setPaymentError(error.response?.data?.message || 'Erreur lors de l\'initiation du paiement');
      toast.error(error.response?.data?.message || 'Erreur lors de l\'initiation du paiement', { id: toastId });
    } finally {
      setIsLoading(false);
      toast.dismiss(toastId);
    }
  };

  // Fonction pour valider l'OTP
  const validateOtp = async () => {
    setIsLoading(true);
    setPaymentError('');
    const toastId = toast.loading('Validation du paiement en cours...');
    try {
      // 1. Valider le paiement OwoPay
      const response = await api.post('https://owomobile-1c888c91ddc9.herokuapp.com/transactions/valider-payment', {
        client_numero_compte: paymentForm.client_numero_compte,
        marchand_numero_compte: paymentForm.marchand_numero_compte,
        montant: paymentForm.montant,
        motif: paymentForm.motif,
        otpCode: parseInt(otpCode)
      });
      const data = response.data as any;
      
      if (data && data.transaction_id) {
        // 2. Si le paiement est réussi, créer la commande avec le transaction_id
        const token = session?.accessToken;
        if (!token) {
          toast.error('Vous devez être connecté pour passer une commande', { id: toastId });
          return;
        }

        const orderData = {
          products: cart.map(item => ({ id: item.id, quantity: item.quantity })),
          transaction_id: data.transaction_id
        };

        const orderResponse = await api.post(
          'https://agriconnect-bc17856a61b8.herokuapp.com/orders',
          orderData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `bearer ${token}`,
            },
          }
        );

        if (orderResponse.status === 201) {
          toast.success(data.message || 'Paiement effectué avec succès', { id: toastId });
          handleClosePaymentDialog();
          clearCart(); // Vider le panier après succès
          router.push('/orders/myorders');
        } else {
          toast.error('Erreur lors de la création de la commande', { id: toastId });
        }
      }
    } catch (error: any) {
      setPaymentError(error.response?.data?.message || 'Erreur lors de la validation du code');
      toast.error(error.response?.data?.message || 'Erreur lors de la validation du code', { id: toastId });
    } finally {
      setIsLoading(false);
      toast.dismiss(toastId);
    }
  };

  // Fonction pour renvoyer l'OTP
  const resendOtp = async () => {
    setIsLoading(true);
    setPaymentError('');
    try {
      await api.post('https://owomobile-1c888c91ddc9.herokuapp.com/transactions/resend-otp', {
        operationId
      });
      setOtpTimer(120);
      setCanResendOtp(false);
      toast.success('Un nouveau code a été envoyé à votre email');
    } catch (error: any) {
      setPaymentError(error.response?.data?.message || 'Erreur lors de l\'envoi du nouveau code');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour fermer la modale de paiement
  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setPaymentStep('initial');
    setOtpCode('');
    setOperationId('');
    setPaymentError('');
    setOtpTimer(120);
    setCanResendOtp(false);
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
      <Box 
        sx={{ 
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          textAlign: 'center',
          background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
          borderRadius: 4,
          boxShadow: '0 4px 24px rgba(0,0,0,0.05)'
        }}
      >
        <Box 
          sx={{ 
            width: 200,
            height: 200,
            mb: 4,
            position: 'relative',
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' },
              '100%': { transform: 'translateY(0px)' }
            }
          }}
        >
          <img 
            src="/images/empty-cart.svg" 
            alt="Panier vide" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Votre panier est vide
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            mb: 4,
            maxWidth: 400,
            lineHeight: 1.6
          }}
        >
          Explorez notre marketplace pour découvrir une large sélection de produits agricoles de qualité
        </Typography>

        <Button
          variant="contained"
          size="large"
          href="/marketplace"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
            boxShadow: '0 4px 20px rgba(76,175,80,0.2)',
            transition: 'all 0.3s ease',
            textTransform: 'none',
            fontSize: '1.1rem',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 25px rgba(76,175,80,0.3)',
              background: 'linear-gradient(45deg, #1B5E20 30%, #388E3C 90%)'
            }
          }}
          startIcon={<i className="ri-shopping-bag-line" style={{ fontSize: '1.5rem' }}></i>}
        >
          Découvrir la marketplace
        </Button>
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
                        Prix : {item.fields.price.toLocaleString('fr-FR')} F CFA / {item.fields.mesure}
                      </Typography>
                      {quantityErrors[item.id] && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          mt: 0.5,
                          animation: 'fadeIn 0.3s ease-in-out',
                          '@keyframes fadeIn': {
                            '0%': { opacity: 0 },
                            '100%': { opacity: 1 }
                          }
                        }}>
                          <Typography variant="body2" sx={{ 
                            color: 'error.main',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}>
                            <i className="ri-error-warning-line" style={{ fontSize: '1rem' }}></i>
                            Quantité disponible : {item.fields.quantity} {item.fields.mesure}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => validateQuantity(item.id, parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1, max: item.fields.quantity }}
                        size="small"
                        sx={{ 
                          width: 80,
                          '& .MuiInputBase-input': {
                            color: quantityErrors[item.id] ? 'error.main' : 'inherit'
                          }
                        }}
                        error={quantityErrors[item.id]}
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
                disabled
                sx={{ 
                  mb: 2,
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.4)',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                  '& .MuiInputLabel-root.Mui-disabled': {
                    color: 'rgba(0, 0, 0, 0.4)',
                  },
                  '& .MuiOutlinedInput-root.Mui-disabled': {
                    '& > fieldset': { borderColor: 'rgba(0, 0, 0, 0.12)' },
                  }
                }}
              />
              <TextField
                fullWidth
                label="Numéro de téléphone"
                value={deliveryInfo.phoneNumber}
                disabled
                type="tel"
                sx={{ 
                  mb: 2,
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.4)',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                  '& .MuiInputLabel-root.Mui-disabled': {
                    color: 'rgba(0, 0, 0, 0.4)',
                  },
                  '& .MuiOutlinedInput-root.Mui-disabled': {
                    '& > fieldset': { borderColor: 'rgba(0, 0, 0, 0.12)' },
                  }
                }}
              />
              <TextField
                fullWidth
                label="Adresse de livraison"
                value={deliveryInfo.address}
                disabled
                sx={{ 
                  mb: 2,
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.4)',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                  '& .MuiInputLabel-root.Mui-disabled': {
                    color: 'rgba(0, 0, 0, 0.4)',
                  },
                  '& .MuiOutlinedInput-root.Mui-disabled': {
                    '& > fieldset': { borderColor: 'rgba(0, 0, 0, 0.12)' },
                  }
                }}
              />
              <TextField
                fullWidth
                label="Instructions supplémentaires"
                value={deliveryInfo.additionalDetails}
                disabled
                multiline
                rows={2}
                sx={{ 
                  mb: 2,
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.4)',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                  '& .MuiInputLabel-root.Mui-disabled': {
                    color: 'rgba(0, 0, 0, 0.4)',
                  },
                  '& .MuiOutlinedInput-root.Mui-disabled': {
                    '& > fieldset': { borderColor: 'rgba(0, 0, 0, 0.12)' },
                  }
                }}
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
              <Box sx={{ 
                mb: 2,
                p: 2,
                backgroundColor: 'background.paper',
                borderRadius: 1,
                boxShadow: '0 0 2px 0 rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mb: 1,
                  color: 'text.secondary'
                }}>
                  <Typography variant="body1">Sous-total</Typography>
                  <Typography variant="body1">{calculateSubtotal().toLocaleString('fr-FR')} F CFA</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mb: 1,
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  opacity: 0.8
                }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span style={{ fontSize: '0.75rem', color: 'inherit' }}>TVA</span>
                    <span style={{ fontSize: '0.75rem', color: 'inherit', opacity: 0.7 }}>(18%)</span>
                  </Typography>
                  <Typography variant="body2">{(calculateSubtotal() * 0.18).toLocaleString('fr-FR')} F CFA</Typography>
                </Box>
                {promoApplied && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mb: 1,
                    color: 'success.main',
                    animation: 'fadeIn 0.5s ease-in-out',
                    '@keyframes fadeIn': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(-10px)'
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0)'
                      }
                    }
                  }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <i className="ri-coupon-line" style={{ fontSize: '1rem' }}></i>
                      <span>Réduction (10%)</span>
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'success.main',
                      fontWeight: 'bold'
                    }}>
                      -{discount.toLocaleString('fr-FR')} F CFA
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  animation: promoApplied ? 'priceUpdate 0.5s ease-in-out' : 'none',
                  '@keyframes priceUpdate': {
                    '0%': {
                      transform: 'scale(1)',
                      color: 'inherit'
                    },
                    '50%': {
                      transform: 'scale(1.05)',
                      color: 'success.main'
                    },
                    '100%': {
                      transform: 'scale(1)',
                      color: 'inherit'
                    }
                  }
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total</Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: promoApplied ? 'success.main' : 'primary.main',
                    transition: 'color 0.3s ease'
                  }}>
                    {(calculateSubtotal() * 1.18 - (promoApplied ? discount : 0)).toLocaleString('fr-FR')} F CFA
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => setPaymentDialogOpen(true)}
                startIcon={<i className="ri-check-line"></i>}
                disabled={hasInvalidQuantity || isLoading}
                sx={{
                  position: 'relative',
                  '&::after': hasInvalidQuantity ? {
                    position: 'absolute',
                    bottom: '-25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.75rem',
                    color: 'error.main',
                    whiteSpace: 'nowrap',
                    animation: 'fadeIn 0.3s ease-in-out',
                    '@keyframes fadeIn': {
                      '0%': { opacity: 0 },
                      '100%': { opacity: 1 }
                    }
                  } : {}
                }}
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
        <DialogTitle sx={{ bgcolor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#222', textAlign: 'center' }}>Paiement Sécurisé</Typography>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 1, textAlign: 'center' }}>
            Effectuez vos transactions en toute sécurité en 2 étapes simples
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#fff', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, boxShadow: '0 4px 24px 0 rgba(76,175,27,0.07)' }}>
          <Box sx={{ p: 2 }}>
            {paymentStep === 'initial' ? (
              <Box component="form" autoComplete="off" sx={{
                display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 400, mx: 'auto',
                background: '#fff', borderRadius: 4, boxShadow: '0 4px 24px rgba(76,175,27,0.07)', p: 3
              }}>
                <TextField
                  fullWidth
                  label="Votre numéro de compte"
                  name="client_numero_compte"
                  value={paymentForm.client_numero_compte}
                  onChange={handlePaymentFormChange}
                  placeholder="Ex: 123456789"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircleIcon sx={{ color: '#4CAF50' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    borderRadius: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#fff',
                      boxShadow: '0 1px 4px rgba(76,175,27,0.04)',
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                        boxShadow: '0 0 0 2px #4CAF5022',
                      },
                      '&:hover': {
                        backgroundColor: '#fff',
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Numéro du marchand"
                  name="marchand_numero_compte"
                  value={paymentForm.marchand_numero_compte}
                  disabled
                  placeholder="Ex: 987654321"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StoreIcon sx={{ color: '#4CAF50' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    borderRadius: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#f1f3f5',
                      '&.Mui-disabled': {
                        backgroundColor: '#f1f3f5',
                        '& input': { WebkitTextFillColor: '#868e96' },
                        '& fieldset': { borderColor: '#e9ecef' },
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Montant (FCFA)"
                  name="montant"
                  value={paymentForm.montant}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaidIcon sx={{ color: '#4CAF50' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    borderRadius: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#f1f3f5',
                      '&.Mui-disabled': {
                        backgroundColor: '#f1f3f5',
                        '& input': { WebkitTextFillColor: '#868e96' },
                        '& fieldset': { borderColor: '#e9ecef' },
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Motif"
                  name="motif"
                  value={paymentForm.motif}
                  onChange={handlePaymentFormChange}
                  placeholder="Ex: Achat de produits"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ChatBubbleOutlineIcon sx={{ color: '#4CAF50' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    borderRadius: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#fff',
                      boxShadow: '0 1px 4px rgba(76,175,27,0.04)',
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                        boxShadow: '0 0 0 2px #4CAF5022',
                      },
                      '&:hover': {
                        backgroundColor: '#fff',
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Code PIN"
                  name="pin"
                  value={paymentForm.pin}
                  onChange={handlePaymentFormChange}
                  type="password"
                  placeholder="•••••"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon sx={{ color: '#4CAF50' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    borderRadius: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#fff',
                      boxShadow: '0 1px 4px rgba(76,175,27,0.04)',
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                        boxShadow: '0 0 0 2px #4CAF5022',
                      },
                      '&:hover': {
                        backgroundColor: '#fff',
                      },
                    },
                  }}
                />
                {paymentError && (
                  <Alert severity="error" sx={{ borderRadius: 3, fontSize: '0.95rem', mt: -2, mb: 1 }}>
                    {paymentError}
                  </Alert>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  sx={{
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    py: 1.5,
                    mt: 1,
                    boxShadow: '0 2px 8px 0 #4CAF1B22',
                    transition: 'all 0.2s',
                    textTransform: 'none',
                    '&:hover': { background: '#388E3C', transform: 'translateY(-2px)' },
                  }}
                  onClick={initiatePayment}
                  disabled={isLoading || !paymentForm.client_numero_compte || !paymentForm.pin}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isLoading ? 'Traitement...' : 'Initier le paiement'}
                </Button>
              </Box>
            ) : (
              <Box sx={{ py: 2 }}>
                <Typography variant="h6" gutterBottom align="center">
                  Vérification du paiement
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                  Un code de vérification a été envoyé à votre email
                </Typography>
                <TextField
                  fullWidth
                  label="Code de vérification"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  type="text"
                  inputProps={{ maxLength: 6 }}
                  sx={{ mb: 2 }}
                  error={!!paymentError}
                  helperText={paymentError}
                />
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 2 
                }}>
                  <Typography variant="body2" color="text.secondary">
                    {otpTimer > 0 ? (
                      `Code valide pendant ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}`
                    ) : (
                      'Code expiré'
                    )}
                  </Typography>
                  <Button
                    size="small"
                    onClick={resendOtp}
                    disabled={!canResendOtp || isLoading}
                  >
                    Renvoyer le code
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleClosePaymentDialog}
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={validateOtp}
                    disabled={isLoading || otpCode.length !== 6}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {isLoading ? 'Vérification...' : 'Valider'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default withAuth(CheckoutPage);