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
  Chip
} from '@mui/material'
import { styled } from '@mui/material/styles'
import {
  AccountCircle as AccountCircleIcon,
  Store as StoreIcon,
  Paid as PaidIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  VpnKey as VpnKeyIcon,
  Email as EmailIcon,
  Timer as TimerIcon
} from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import api from 'src/api/axiosConfig'
import { Order } from '@/hooks/useOrders'

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
  order: Order | null
  adminCompte: number | null
  onPaymentSuccess: () => void
  selectedFarmerId?: string // Nouveau prop pour spécifier quel agriculteur payer
}

const FarmerPaymentDialog: React.FC<FarmerPaymentDialogProps> = ({
  open,
  onClose,
  order,
  adminCompte,
  onPaymentSuccess,
  selectedFarmerId
}) => {
  const { data: session } = useSession()
  const [paymentStep, setPaymentStep] = useState<'initial' | 'otp'>('initial')
  const [isLoading, setIsLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [operationId, setOperationId] = useState('')
  const [otpTimer, setOtpTimer] = useState(120)
  const [canResendOtp, setCanResendOtp] = useState(false)

  const [paymentForm, setPaymentForm] = useState({
    business_numero_compte: '',
    orderId: '',
    motif: 'Paiement agriculteur',
    pin: ''
  })

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
    if (open && order && adminCompte) {
      setPaymentForm({
        business_numero_compte: adminCompte.toString(),
        orderId: order.id,
        motif: 'Paiement agriculteur',
        pin: ''
      })
      setPaymentStep('initial')
      setOtpCode('')
      setOperationId('')
      setPaymentError('')
      setOtpTimer(120)
      setCanResendOtp(false)
    }
  }, [open, order, adminCompte])

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

  const initiatePayment = async () => {
    if (!order || !adminCompte) return

    setIsLoading(true)
    setPaymentError('')
    const toastId = toast.loading('Paiement en cours...')

    try {
      const response = await api.post('https://owomobile-1c888c91ddc9.herokuapp.com/agripay/initiate-agripay', {
        business_numero_compte: paymentForm.business_numero_compte,
        orderId: order.id,
        motif: paymentForm.motif,
        pin: paymentForm.pin
      }, {
        // headers: {
        //   'Authorization': `bearer ${session?.accessToken}`
        // }
      })

      const data = response.data as any
      const opId = data.operationId || data.OperationId

      if (opId) {
        setOperationId(opId)
        setPaymentStep('otp')
        setOtpTimer(120)
        setCanResendOtp(false)
        toast.success('Paiement initialisé avec succès', { id: toastId })
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
    const toastId = toast.loading('Validation du paiement...')

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
        toast.success('Paiement effectué avec succès !', { 
          id: toastId,
          duration: 3000
        })
        onPaymentSuccess()
        handleClose()
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
    setPaymentStep('initial')
    setOtpCode('')
    setOperationId('')
    setPaymentError('')
    setOtpTimer(120)
    setCanResendOtp(false)
    onClose()
  }

  if (!order || !adminCompte) return null

  // Construire le nom de l'agriculteur de manière unique
  const farmerNamesMap = new Map<string, number>()
  const farmerFirstNames = order.fields.farmerFirstName || []
  const farmerLastNames = order.fields.farmerLastName || []
  const farmerOwoAccounts = order.fields.farmerOwoAccount || []
  
  for (let i = 0; i < farmerFirstNames.length; i++) {
    const firstName = farmerFirstNames[i] || ''
    const lastName = farmerLastNames[i] || ''
    const fullName = `${firstName} ${lastName}`.trim()
    if (fullName) {
      farmerNamesMap.set(fullName, farmerOwoAccounts[i] || 0)
    }
  }
  
  const uniqueFarmerNames = Array.from(farmerNamesMap.keys())
  const uniqueFarmerOwoAccounts = Array.from(farmerNamesMap.values())
  
  const farmerName = uniqueFarmerNames.join(', ') || 'Agriculteur inconnu'
  const farmerCompteOwo = order.fields.farmerOwoAccount?.[0] || 0

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
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
                Paiement de l'agriculteur
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Commande {order.fields.orderNumber || order.id}
              </Typography>
            </Box>

            {/* Sélecteur d'agriculteur si plusieurs agriculteurs */}
            {/* <Paper sx={{ p: 3, mb: 3, bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Sélectionner l'agriculteur
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {availableFarmers.map((farmer, index) => (
                    <Box
                      key={farmer.farmerId}
                      sx={{
                        p: 2,
                        border: selectedFarmerIndex === index ? '2px solid #388e3c' : '1px solid #e0e0e0',
                        borderRadius: 2,
                        cursor: 'pointer',
                        backgroundColor: selectedFarmerIndex === index ? '#f1f8e9' : 'transparent',
                        '&:hover': {
                          backgroundColor: selectedFarmerIndex === index ? '#f1f8e9' : '#f5f5f5'
                        }
                      }}
                      onClick={() => setSelectedFarmerIndex(index)}
                    >
                      <Typography variant="body1" fontWeight={500}>
                        {farmer.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Compte: {farmer.compteOwo} | Montant: {farmer.totalAmount?.toLocaleString('fr-FR')} FCFA
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper> */}

            {/* Résumé du paiement */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'white' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Résumé du paiement
              </Typography>

              {uniqueFarmerNames.length > 1 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                    Détail des agriculteurs:
                  </Typography>
                  {uniqueFarmerNames.map((name, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{name}:</Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        {uniqueFarmerOwoAccounts[index]}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Montant à payer:</Typography>
                <Typography variant="h6" fontWeight={600} color="primary">
                  {order.fields.totalPrice?.toLocaleString('fr-FR')} FCFA
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Commande:</Typography>
                <Typography fontWeight={500}>
                  {order.fields.orderNumber || order.id}
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
                label="Montant (FCFA)"
                name="montant"
                value={order.fields.totalPrice?.toLocaleString('fr-FR')}
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

        {/* Étape 2 - Validation OTP */}
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
                Validation OTP
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Entrez le code de validation reçu par email
              </Typography>
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
        
        {paymentStep === 'initial' ? (
          <Button
            variant="outlined"
            onClick={initiatePayment}
            disabled={isLoading || !paymentForm.business_numero_compte || !paymentForm.pin}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              minWidth: 200,
              py: 1.5,
              borderRadius: 2,
              borderColor: '#388e3c',
              color: '#388e3c',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                borderColor: '#2E7D32',
                backgroundColor: 'rgba(56, 142, 60, 0.04)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(56, 142, 60, 0.2)'
              },
              '&:disabled': {
                borderColor: '#e0e0e0',
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