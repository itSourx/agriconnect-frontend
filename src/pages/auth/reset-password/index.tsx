import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { Visibility, VisibilityOff, Refresh } from '@mui/icons-material'
import { toast } from 'react-hot-toast'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import themeConfig from 'src/configs/themeConfig'
import { API_BASE_URL } from 'src/configs/constants'

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)'
}))

const ResetPasswordPage = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Rediriger si l'utilisateur n'est pas connecté
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Rediriger si l'utilisateur a déjà un accessToken
  React.useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      router.push('/')
    }
  }, [status, session, router])

  const handleClearCache = async () => {
    try {
      // Nettoyer le localStorage
      localStorage.clear()
      
      // Nettoyer le sessionStorage
      sessionStorage.clear()
      
      // Supprimer les cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      })
      
      // Déconnecter l'utilisateur
      await signOut({ redirect: false })
      
      toast.success('Cache nettoyé ! Redirection vers la page de connexion...')
      
      // Rediriger vers le login
      setTimeout(() => {
        router.push('/auth/login')
      }, 1000)
      
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error)
      toast.error('Erreur lors du nettoyage du cache')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!temporaryPassword || !newPassword || !confirmPassword) {
      setError('Tous les champs sont requis')
      return
    }

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Le mot de passe doit contenir au moins une majuscule')
      return
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('Le mot de passe doit contenir au moins une minuscule')
      return
    }

    if (!/\d/.test(newPassword)) {
      setError('Le mot de passe doit contenir au moins un chiffre')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    try {
      setLoading(true)

      // Appel à l'API avec email, temporaryPassword et newPassword
      const response = await fetch(`${API_BASE_URL}/users/validate-reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: session?.user?.email,
          temporaryPassword,
          newPassword
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors du changement de mot de passe')
      }

      toast.success('Mot de passe changé avec succès ! Veuillez vous reconnecter.')
      
      // Déconnecter l'utilisateur et rediriger vers le login
      await signOut({ redirect: false })
      router.push('/auth/login')
      
    } catch (err: any) {
      console.error('Erreur lors du changement de mot de passe:', err)
      setError(err.message || 'Erreur lors du changement de mot de passe')
      toast.error(err.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 2
      }}
    >
      <StyledCard sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src={themeConfig.logo.src}
              alt={`${themeConfig.templateName} Logo`}
              sx={{
                width: { xs: '120px', sm: themeConfig.logo.width },
                height: { xs: 'auto', sm: themeConfig.logo.height },
                objectFit: 'contain',
                mb: 3
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Changement de mot de passe requis
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Pour des raisons de sécurité, vous devez changer votre mot de passe avant de continuer.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Mot de passe temporaire"
              type={showTemporaryPassword ? 'text' : 'password'}
              value={temporaryPassword}
              onChange={(e) => setTemporaryPassword(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowTemporaryPassword(!showTemporaryPassword)}
                      edge="end"
                    >
                      {showTemporaryPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Nouveau mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Confirmer le mot de passe"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 4 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                mb: 2
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Changer le mot de passe'
              )}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OU
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Refresh />}
            onClick={handleClearCache}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              borderColor: 'warning.main',
              color: 'warning.main',
              '&:hover': {
                borderColor: 'warning.dark',
                backgroundColor: 'warning.light',
                color: 'warning.dark'
              }
            }}
          >
            Nettoyer le cache et retourner au login
          </Button>
        </CardContent>
      </StyledCard>
    </Box>
  )
}

ResetPasswordPage.getLayout = (page: React.ReactNode) => <BlankLayout>{page}</BlankLayout>

export default ResetPasswordPage 