import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
  Paper,
  Divider,
  Chip,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material'
import { styled } from '@mui/material/styles'
import {
  AccountCircle as AccountCircleIcon,
  Store as StoreIcon,
  Paid as PaidIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  VpnKey as VpnKeyIcon,
  Email as EmailIcon,
  Timer as TimerIcon,
  ShoppingCart as ShoppingCartIcon,
  Payment as PaymentIcon
} from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import api from 'src/api/axiosConfig'
import { FarmerPayment, Order } from '@/hooks/useOrders'

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    maxWidth: 600,
    width: '100%'
  }
}))

interface FarmerPaymentDialogProps {
  open: boolean
  onClose: () => void
  farmerPayment: FarmerPayment | null
  onPaymentSuccess: () => void
}

const FarmerPaymentDialog: React.FC<FarmerPaymentDialogProps> = ({
  open,
  onClose,
  farmerPayment,
  onPaymentSuccess
}) => {
  const { data: session } = useSession()
  const [paymentStep, setPaymentStep] = useState<'selection' | 'initial' | 'otp'>('selection')
  const [isLoading, setIsLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [operationId, setOperationId] = useState('')
  const [otpTimer, setOtpTimer] = useState(120)
  const [canResendOtp, setCanResendOtp] = useState(false)
  const [userCompteOwo, setUserCompteOwo] = useState<number>(0)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0)
  const [ordersToPay, setOrdersToPay] = useState<Order[]>([])

  const [paymentForm, setPaymentForm] = useState({
    business_numero_compte: '',
    orderId: '',
    motif: 'Paiement agriculteur',
    pin: ''
  })

  // Récupérer le compte OWO de l'utilisateur courant
  useEffect(() => {
    const fetchUserCompteOwo = async () => {
      if (!session?.user?.id || !session?.accessToken) return

      try {
        const response = await api.get(`/users/${session.user.id}`, {
          headers: {
            Accept: '*/*',
            Authorization: `bearer ${session.accessToken}`,
          },
        })

        const data = response.data as any
        const userFields = data.fields
        const compteOwo = userFields.compteOwo || 0
        setUserCompteOwo(compteOwo)
      } catch (error) {
        console.error('Erreur lors de la récupération du compte OWO:', error)
      }
    }

    if (open) {
      fetchUserCompteOwo()
    }
  }, [session, open])

  // Timer pour l'OTP
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (paymentStep === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setCanResendOtp(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [paymentStep, otpTimer])

  // Réinitialiser le formulaire quand le dialogue s'ouvre
  useEffect(() => {
    if (open && farmerPayment) {
      setPaymentForm({
        business_numero_compte: userCompteOwo.toString(),
        orderId: '',
        motif: 'Paiement agriculteur',
        pin: ''
      })
      setPaymentStep('selection')
      setOtpCode('')
      setOperationId('')
      setPaymentError('')
      setOtpTimer(120)
      setCanResendOtp(false)
      setSelectedOrders(new Set())
      setCurrentOrderIndex(0)
      setOrdersToPay([])
    }
  }, [open, farmerPayment, userCompteOwo])

  const handlePaymentFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPaymentForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length > 5) return
    const numericValue = value.replace(/\D/g, '')
    const limitedValue = numericValue.slice(0, 5)
    setPaymentForm(prev => ({ ...prev, pin: limitedValue }))
  }

  const handleOrderSelection = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders)
    if (checked) {
      newSelected.add(orderId)
    } else {
      newSelected.delete(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedOrders.size === farmerPayment?.orders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(farmerPayment?.orders.map(order => order.id) || []))
    }
  }

  const handleStartPayment = () => {
    if (selectedOrders.size === 0) {
      setPaymentError('Veuillez sélectionner au moins une commande à payer')
      return
    }

    const selectedOrdersList = farmerPayment?.orders.filter(order => selectedOrders.has(order.id)) || []
    setOrdersToPay(selectedOrdersList)
    setCurrentOrderIndex(0)
    setPaymentStep('initial')
    
    // Pré-remplir avec la première commande
    if (selectedOrdersList.length > 0) {
      setPaymentForm(prev => ({
        ...prev,
        orderId: selectedOrdersList[0].id
      }))
    }
  }

  const initiatePayment = async () => {
    if (!farmerPayment || ordersToPay.length === 0) return

    setIsLoading(true)
    setPaymentError('')
    const toastId = toast.loading(`Paiement en cours pour la commande ${currentOrderIndex + 1}/${ordersToPay.length}...`)

    try {
      const currentOrder = ordersToPay[currentOrderIndex]
      
      const response = await api.post('https://owomobile-1c888c91ddc9.herokuapp.com/agripay/initiate-agripay', {
        business_numero_compte: paymentForm.business_numero_compte,
        orderId: currentOrder.id,
        motif: paymentForm.motif,
        pin: paymentForm.pin
      }, {
        headers: {
          'Authorization': `bearer ${session?.accessToken}`
        }
      })

      const data = response.data as any
      const opId = data.operationId || data.OperationId

      if (opId) {
        setOperationId(opId)
        setPaymentStep('otp')
        setOtpTimer(120)
        setCanResendOtp(false)
        toast.success(`Paiement initialisé pour la commande ${currentOrder.fields.orderNumber || currentOrder.id}`, { id: toastId })
      }
    } catch (error: any) {
      setPaymentError(error.response?.data?.message || 'Erreur lors de l\'initiation du paiement')
      toast.error(error.response?.data?.message || 'Erreur lors de l\'initiation du paiement', { id: toastId })
    } finally {
      setIsLoading(false)
      toast.dismiss(toastId)
    }
  }

  const validateOtp = async () => {
    setIsLoading(true)
    setPaymentError('')
    const toastId = toast.loading(`Validation du paiement pour la commande ${currentOrderIndex + 1}/${ordersToPay.length}...`)

    try {
      const response = await api.post('https://owomobile-1c888c91ddc9.herokuapp.com/agripay/validate-agripay', {
        business_numero_compte: paymentForm.business_numero_compte,
        operationId: operationId,
        otpCode: parseInt(otpCode)
      }, {
        headers: {
          'Authorization': `bearer ${session?.accessToken}`
        }
      })

      const data = response.data as any
      
      if (data && data.transaction_id) {
        // Passer à la commande suivante ou terminer
        if (currentOrderIndex < ordersToPay.length - 1) {
          setCurrentOrderIndex(prev => prev + 1)
          const nextOrder = ordersToPay[currentOrderIndex + 1]
          setPaymentForm(prev => ({
            ...prev,
            orderId: nextOrder.id
          }))
          setPaymentStep('initial')
          setOtpCode('')
          setOperationId('')
          toast.success(`Paiement validé pour la commande ${nextOrder.fields.orderNumber || nextOrder.id}`, { id: toastId })
        } else {
          // Toutes les commandes ont été payées
          toast.success('Tous les paiements ont été effectués avec succès !', { 
            id: toastId,
            duration: 3000
          })
          onPaymentSuccess()
          handleClose()
        }
      }
    } catch (error: any) {
      setPaymentError(error.response?.data?.message || 'Erreur lors de la validation du code')
      toast.error(error.response?.data?.message || 'Erreur lors de la validation du code', { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  const resendOtp = async () => {
    setIsLoading(true)
    setPaymentError('')
    try {
      await api.post('https://owomobile-1c888c91ddc9.herokuapp.com/agripay/resend-otp', {
        operationId
      }, {
        headers: {
          'Authorization': `bearer ${session?.accessToken}`
        }
      })
      setOtpTimer(120)
      setCanResendOtp(false)
      toast.success('Un nouveau code a été envoyé à votre email')
    } catch (error: any) {
      setPaymentError(error.response?.data?.message || 'Erreur lors de l\'envoi du nouveau code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setPaymentStep('selection')
    setOtpCode('')
    setOperationId('')
    setPaymentError('')
    setOtpTimer(120)
    setCanResendOtp(false)
    setSelectedOrders(new Set())
    setCurrentOrderIndex(0)
    setOrdersToPay([])
    onClose()
  }

  if (!farmerPayment) return null

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Étape 1 - Sélection des commandes */}
        <Box
          sx={{
            p: 4,
            display: paymentStep === 'selection' ? 'block' : 'none',
            background: '#fafafa',
            minHeight: '500px'
          }}
        >
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h6" sx={{ 
                color: 'text.primary',
                fontWeight: 600,
                mb: 1
              }}>
                Sélection des commandes à payer
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Choisissez les commandes que vous souhaitez payer pour {farmerPayment.name}
              </Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 3, bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Commandes disponibles
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedOrders.size === farmerPayment.orders.length}
                      indeterminate={selectedOrders.size > 0 && selectedOrders.size < farmerPayment.orders.length}
                      onChange={handleSelectAll}
                    />
                  }
                  label="Tout sélectionner"
                />
              </Box>

              <List>
                {farmerPayment.orders.map((order) => (
                  <ListItem key={order.id} divider>
                    <Checkbox
                      checked={selectedOrders.has(order.id)}
                      onChange={(e) => handleOrderSelection(order.id, e.target.checked)}
                    />
                    <ListItemText
                      primary={`Commande ${order.fields.orderNumber || order.id}`}
                      secondary={`${order.fields.totalPrice?.toLocaleString('fr-FR')} FCFA`}
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={order.fields.totalPrice?.toLocaleString('fr-FR') + ' FCFA'} 
                        color="primary" 
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedOrders.size} commande(s) sélectionnée(s)
                </Typography>
                <Typography variant="h6" fontWeight={600} color="primary">
                  Total: {farmerPayment.orders
                    .filter(order => selectedOrders.has(order.id))
                    .reduce((sum, order) => sum + (order.fields.totalPrice || 0), 0)
                    .toLocaleString('fr-FR')} FCFA
                </Typography>
              </Box>
            </Paper>

            {paymentError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {paymentError}
              </Alert>
            )}
          </Box>
        </Box>

        {/* Étape 2 - Informations de paiement */}
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
                Étape {currentOrderIndex + 1} sur {ordersToPay.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Paiement de la commande {ordersToPay[currentOrderIndex]?.fields.orderNumber || ordersToPay[currentOrderIndex]?.id}
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
                  width: `${((currentOrderIndex + 1) / ordersToPay.length) * 100}%`,
                  height: '100%',
                  backgroundColor: '#388e3c',
                  borderRadius: 2,
                  transition: 'width 0.5s ease'
                }} />
              </Box>
            </Box>

            {/* Résumé du paiement */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'white' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Résumé du paiement
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Agriculteur:</Typography>
                <Typography fontWeight={500}>{farmerPayment.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Compte OWO:</Typography>
                <Typography fontWeight={500}>{farmerPayment.compteOwo}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Montant à payer:</Typography>
                <Typography variant="h6" fontWeight={600} color="primary">
                  {ordersToPay[currentOrderIndex]?.fields.totalPrice?.toLocaleString('fr-FR')} FCFA
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Commande:</Typography>
                <Typography fontWeight={500}>
                  {ordersToPay[currentOrderIndex]?.fields.orderNumber || ordersToPay[currentOrderIndex]?.id}
                </Typography>
              </Box>
            </Paper>

            {/* Formulaire de paiement */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Numéro de compte business"
                name="business_numero_compte"
                value={paymentForm.business_numero_compte}
                disabled
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
                    '&.Mui-disabled': {
                      backgroundColor: '#fafafa',
                      '& input': { WebkitTextFillColor: '#6c757d' },
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Numéro de compte agriculteur"
                name="farmer_compte"
                value={farmerPayment.compteOwo}
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
                value={ordersToPay[currentOrderIndex]?.fields.totalPrice?.toLocaleString('fr-FR')}
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
                placeholder="Ex: Paiement agriculteur"
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
                type="password"
                value={paymentForm.pin}
                onChange={handlePinChange}
                placeholder="Entrez votre code PIN"
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
                <Alert severity="error" sx={{ mt: 2 }}>
                  {paymentError}
                </Alert>
              )}
            </Box>
          </Box>
        </Box>

        {/* Étape 3 - Validation OTP */}
        <Box
          sx={{
            p: 4,
            display: paymentStep === 'otp' ? 'block' : 'none',
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
                Validation OTP - Commande {currentOrderIndex + 1}/{ordersToPay.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Entrez le code de validation reçu par email
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
                  width: `${((currentOrderIndex + 1) / ordersToPay.length) * 100}%`,
                  height: '100%',
                  backgroundColor: '#388e3c',
                  borderRadius: 2,
                  transition: 'width 0.5s ease'
                }} />
              </Box>
            </Box>

            <Paper sx={{ p: 3, mb: 3, bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 1, color: '#388e3c' }} />
                <Typography variant="h6" fontWeight={600}>
                  Code de validation
                </Typography>
              </Box>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Un code de validation a été envoyé à votre adresse email.
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TimerIcon sx={{ mr: 1, color: otpTimer > 0 ? '#388e3c' : '#f44336' }} />
                <Typography variant="body2" color={otpTimer > 0 ? 'text.secondary' : 'error'}>
                  {otpTimer > 0 
                    ? `Temps restant: ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}`
                    : 'Temps expiré'
                  }
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Code OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Entrez le code à 6 chiffres"
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

              {canResendOtp && (
                <Button
                  onClick={resendOtp}
                  disabled={isLoading}
                  sx={{ mt: 2 }}
                  color="primary"
                >
                  Renvoyer le code
                </Button>
              )}
            </Paper>

            {paymentError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {paymentError}
              </Alert>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            minWidth: 120,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          Annuler
        </Button>
        
        {paymentStep === 'selection' ? (
          <Button
            variant="outlined"
            onClick={handleStartPayment}
            disabled={selectedOrders.size === 0}
            startIcon={<PaymentIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            PAYER
          </Button>
        ) : paymentStep === 'initial' ? (
          <Button
            variant="contained"
            onClick={initiatePayment}
            disabled={isLoading || !paymentForm.business_numero_compte || !paymentForm.pin}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
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
            disabled={isLoading || !otpCode || otpCode.length !== 6}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
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
            {isLoading ? 'Validation...' : 'Valider le paiement'}
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  )
}

export default FarmerPaymentDialog 