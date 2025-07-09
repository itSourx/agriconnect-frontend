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
import Container from '@mui/material/Container';
import api from 'src/api/axiosConfig';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import StoreIcon from '@mui/icons-material/Store';
import PaidIcon from '@mui/icons-material/Paid';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { API_BASE_URL } from 'src/configs/constants';


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
  const [clearCartDialogOpen, setClearCartDialogOpen] = useState(false);

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
        const response = await api.get<SuperAdminResponse>(`/users/superadmin`, {
          headers: {
            'Authorization': `bearer ${session?.accessToken}`
          }
        });
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
  }, [session?.accessToken]);

  // Pré-remplir les informations de l'utilisateur
  useEffect(() => {
    if (user) {
      setDeliveryInfo({
        contactName: `${user.FirstName} ${user.LastName}`,
        phoneNumber: user.Phone || '',
        address: user.Address || '',
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
      }, {
        headers: {
          'Authorization': `bearer ${session?.accessToken}`
        }
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
      }, {
        headers: {
          'Authorization': `bearer ${session?.accessToken}`
        }
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
          transaction_id: data.transaction_id,
          totalPaid: paymentForm.montant
        };

        const orderResponse = await api.post(
          `${API_BASE_URL}/orders`,
          orderData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `bearer ${session?.accessToken}`,
            },
          }
        );

        if (orderResponse.status === 201) {
          // Afficher le message de succès
          toast.success('Paiement effectué avec succès !', { 
            id: toastId,
            duration: 3000
          });
          
          // Fermer la modale de paiement
          handleClosePaymentDialog();
          
          // Attendre un peu pour que l'utilisateur voie le message
          setTimeout(() => {
            // Vider le panier
            clearCart();
            // Rediriger vers les commandes
            router.push('/orders/myorders');
          }, 1500);
        } else {
          toast.error('Erreur lors de la création de la commande', { id: toastId });
        }
      }
    } catch (error: any) {
      setPaymentError(error.response?.data?.message || 'Erreur lors de la validation du code');
      toast.error(error.response?.data?.message || 'Erreur lors de la validation du code', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour renvoyer l'OTP
  const resendOtp = async () => {
    setIsLoading(true);
    setPaymentError('');
    try {
      await api.post('https://owomobile-1c888c91ddc9.herokuapp.com/transactions/resend-otp', {
        operationId
      }, {
        headers: {
          'Authorization': `bearer ${session?.accessToken}`
        }
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

  // Fonction pour vider le panier
  const handleClearCart = () => {
    clearCart();
    setClearCartDialogOpen(false);
    toast.success('Panier vidé avec succès');
    router.push('/marketplace');
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
        `${API_BASE_URL}/orders`,
        orderData,
        {
        headers: {
          'Content-Type': 'application/json',
            Authorization: `bearer ${session?.accessToken}`,
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Finaliser votre commande
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Votre panier ({cart.length} article(s))</Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteSweepIcon />}
                  onClick={() => setClearCartDialogOpen(true)}
                  size="small"
                  sx={{
                    textTransform: 'none',
                    borderColor: 'error.main',
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: 'error.main',
                      color: 'white',
                      borderColor: 'error.main'
                    }
                  }}
                >
                  Vider le panier
                </Button>
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
                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, contactName: e.target.value })}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircleIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Téléphone"
                value={deliveryInfo.phoneNumber}
                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phoneNumber: e.target.value })}
                margin="normal"
                placeholder="+229 52 80 54 08"
              />
              <TextField
                fullWidth
                label="Adresse"
                value={deliveryInfo.address}
                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Résumé de la commande
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Sous-total :</Typography>
                  <Typography>{calculateSubtotal().toLocaleString('fr-FR')} F CFA</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>TVA (18%) :</Typography>
                  <Typography>{(calculateSubtotal() * 0.18).toLocaleString('fr-FR')} F CFA</Typography>
                </Box>
                {promoApplied && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ color: 'success.main' }}>Réduction :</Typography>
                    <Typography sx={{ color: 'success.main' }}>-{discount.toLocaleString('fr-FR')} F CFA</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total :</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {(total * 1.18).toLocaleString('fr-FR')} F CFA
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => setPaymentDialogOpen(true)}
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
                  boxShadow: '0 4px 20px rgba(76,175,80,0.2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1B5E20 30%, #388E3C 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(76,175,80,0.3)'
                  }
                }}
                startIcon={<i className="ri-bank-card-line" style={{ fontSize: '1.5rem' }}></i>}
              >
                {isLoading ? 'Traitement...' : 'Procéder au paiement'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de confirmation pour vider le panier */}
      <Dialog
        open={clearCartDialogOpen}
        onClose={() => setClearCartDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <DeleteSweepIcon sx={{ fontSize: '1.5rem' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Vider le panier
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 2 }}>
            Êtes-vous sûr de vouloir vider votre panier ?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Cette action supprimera tous les articles de votre panier et ne peut pas être annulée.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            variant="outlined"
            onClick={() => setClearCartDialogOpen(false)}
            sx={{ 
              borderColor: '#e0e0e0',
              color: '#666',
              '&:hover': {
                borderColor: '#bdbdbd',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleClearCart}
            startIcon={<DeleteSweepIcon />}
            sx={{
              bgcolor: '#d32f2f',
              '&:hover': { bgcolor: '#b71c1c' }
            }}
          >
            Vider le panier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de paiement */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }
        }}
      >
        
        <DialogContent sx={{ p: 0 }}>
          {/* Étape 1 - Informations de paiement */}
          <Box
            sx={{
              p: 4,
              display: paymentStep === 'initial' ? 'block' : 'none',
              background: '#fafafa',
              minHeight: '500px'
            }}
          >
            <Box sx={{ maxWidth: 500, mx: 'auto' }}>
              {/* En-tête de l'étape */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  color: 'text.primary',
                  fontWeight: 600,
                  mb: 1
                }}>
                  Étape 1 sur 2
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Renseignez vos informations de paiement
                </Typography>
                {/* Barre de progression */}
                <Box sx={{ 
                  width: '100%', 
                  height: 4, 
                  backgroundColor: '#e0e0e0', 
                  borderRadius: 2,
                  mt: 2,
                  position: 'relative'
                }}>
                  <Box sx={{
                    width: '50%',
                    height: '100%',
                    backgroundColor: '#388e3c',
                    borderRadius: 2,
                    transition: 'width 0.5s ease'
                  }} />
                </Box>
              </Box>

              {/* Résumé de commande */}
              <Box sx={{ 
                backgroundColor: '#fff',
                borderRadius: 3,
                p: 3,
                mb: 4,
                border: '1px solid #e9ecef'
              }}>
                <Typography variant="h6" sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2,
                  color: '#388e3c'
                }}>
                  <i className="ri-shopping-cart-line" style={{ color: '#388e3c' }}></i>
                  Résumé de votre commande
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Articles ({cart.length})</Typography>
                  <Typography variant="body2">{calculateSubtotal().toLocaleString('fr-FR')} F CFA</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">TVA (18%)</Typography>
                  <Typography variant="body2">{(calculateSubtotal() * 0.18).toLocaleString('fr-FR')} F CFA</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#388e3c' }}>
                    {paymentForm.montant.toLocaleString('fr-FR')} F CFA
                  </Typography>
                </Box>
              </Box>

              {/* Formulaire de paiement */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Numéro de compte client"
                  name="client_numero_compte"
                  value={paymentForm.client_numero_compte}
                  onChange={handlePaymentFormChange}
                  placeholder="Ex: 22912345678"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircleIcon sx={{ color: '#388e3c' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafafa',
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#388e3c',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: '#388e3c',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#388e3c',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Numéro de compte marchand"
                  name="marchand_numero_compte"
                  value={paymentForm.marchand_numero_compte}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StoreIcon sx={{ color: '#388e3c' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafafa',
                      borderRadius: 2,
                      '&.Mui-disabled': {
                        backgroundColor: '#fafafa',
                        '& input': { WebkitTextFillColor: '#6c757d' },
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Montant (FCFA)"
                  name="montant"
                  value={paymentForm.montant.toLocaleString('fr-FR')}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaidIcon sx={{ color: '#388e3c' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafafa',
                      borderRadius: 2,
                      '&.Mui-disabled': {
                        backgroundColor: '#fafafa',
                        '& input': { WebkitTextFillColor: '#6c757d' },
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Motif du paiement"
                  name="motif"
                  value={paymentForm.motif}
                  onChange={handlePaymentFormChange}
                  placeholder="Ex: Achat de produits agricoles"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ChatBubbleOutlineIcon sx={{ color: '#388e3c' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafafa',
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#388e3c',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: '#388e3c',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#388e3c',
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
                  placeholder="Votre code PIN à 4 chiffres"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon sx={{ color: '#388e3c' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafafa',
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#388e3c',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: '#388e3c',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#388e3c',
                    },
                  }}
                />

                {paymentError && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      borderRadius: 2,
                      backgroundColor: '#ffebee',
                      border: '1px solid #ffcdd2',
                      '& .MuiAlert-icon': {
                        color: '#d32f2f'
                      }
                    }}
                  >
                    {paymentError}
                  </Alert>
                )}
                
              </Box>
            </Box>
          </Box>

          {/* Étape 2 - Vérification OTP */}
          <Box
            sx={{
              p: 4,
              display: paymentStep === 'otp' ? 'block' : 'none',
              background: '#fafafa',
              minHeight: '400px'
            }}
          >
            <Box sx={{ maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
              {/* En-tête de l'étape */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  color: '#388e3c', 
                  fontWeight: 600,
                  mb: 1
                }}>
                  Étape 2 sur 2
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Vérification de sécurité
                </Typography>
                {/* Barre de progression */}
                <Box sx={{ 
                  width: '100%', 
                  height: 4, 
                  backgroundColor: '#e0e0e0', 
                  borderRadius: 2,
                  mt: 2,
                  position: 'relative'
                }}>
                  <Box sx={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#388e3c',
                    borderRadius: 2,
                    transition: 'width 0.5s ease'
                  }} />
                </Box>
              </Box>

              {/* Icône de vérification */}
              <Box sx={{ 
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: '#e8f5e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                border: '3px solid #388e3c'
              }}>
                <i className="ri-mail-check-line" style={{ fontSize: '2rem', color: '#388e3c' }}></i>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Code de vérification envoyé
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Nous avons envoyé un code de vérification à votre adresse email. 
                Veuillez le saisir ci-dessous pour confirmer votre paiement.
              </Typography>

              <TextField
                fullWidth
                label="Code de vérification"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                type="text"
                inputProps={{ 
                  maxLength: 6,
                  style: { 
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    letterSpacing: '0.5rem',
                    fontWeight: 'bold'
                  }
                }}
                placeholder="••••••"
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    '&.Mui-focused fieldset': {
                      borderColor: paymentError ? '#d32f2f' : '#388e3c',
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: paymentError ? '#d32f2f' : '#388e3c',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: paymentError ? '#d32f2f' : '#388e3c',
                  },
                }}
                error={!!paymentError}
                helperText={paymentError}
              />

              {/* Timer et bouton renvoyer */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 4,
                p: 2,
                backgroundColor: otpTimer === 0 ? '#ffebee' : '#f8f9fa',
                borderRadius: 2,
                border: `1px solid ${otpTimer === 0 ? '#ffcdd2' : '#e9ecef'}`
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: otpTimer === 0 ? '#d32f2f' : '#6c757d',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <i className="ri-time-line"></i>
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
                  sx={{ 
                    color: '#388e3c',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#e8f5e8'
                    }
                  }}
                >
                  Renvoyer le code
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3,
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e9ecef'
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            width: '100%',
            justifyContent: paymentStep === 'initial' ? 'space-between' : 'center'
          }}>
            <Button
              variant="outlined"
              onClick={handleClosePaymentDialog}
              disabled={isLoading}
              sx={{ 
                borderColor: '#e0e0e0',
                color: '#6c757d',
                minWidth: 120,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  borderColor: '#bdbdbd',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              Annuler
            </Button>
            
            {paymentStep === 'initial' ? (
              <Button
                variant="contained"
                onClick={initiatePayment}
                disabled={isLoading || !paymentForm.client_numero_compte || !paymentForm.pin}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <i className="ri-arrow-right-line"></i>}
                sx={{
                  minWidth: 200,
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
                  boxShadow: '0 4px 20px rgba(76,175,80,0.3)',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1B5E20 30%, #388E3C 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(76,175,80,0.4)'
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e',
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
              >
                {isLoading ? 'Traitement...' : 'Initier le paiement'}
              </Button>
            ) : (
              <Button 
                variant="contained"
                onClick={validateOtp}
                disabled={isLoading || otpCode.length !== 6}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <i className="ri-check-line"></i>}
                sx={{
                  minWidth: 200,
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
                  boxShadow: '0 4px 20px rgba(76,175,80,0.3)',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1B5E20 30%, #388E3C 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(76,175,80,0.4)'
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e',
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
              >
                {isLoading ? 'Vérification...' : 'Confirmer le paiement'}
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(CheckoutPage);