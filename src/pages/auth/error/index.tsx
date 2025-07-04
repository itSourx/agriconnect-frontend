// ** React Imports
import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Card, CardContent, Typography, Button, Box } from '@mui/material'
import { Alert, AlertTitle } from '@mui/material'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Component Import
import Error404 from 'src/pages/404'

const ErrorPage = () => {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const { error } = router.query
    
    // Map NextAuth error codes to user-friendly messages
    const errorMessages: { [key: string]: string } = {
      'Configuration': 'Erreur de configuration du système d\'authentification',
      'AccessDenied': 'Accès refusé',
      'Verification': 'Erreur de vérification',
      'Default': 'Une erreur inattendue s\'est produite',
      'CredentialsSignin': 'Email ou mot de passe incorrect',
      'OAuthSignin': 'Erreur lors de la connexion avec le fournisseur OAuth',
      'OAuthCallback': 'Erreur lors du callback OAuth',
      'OAuthCreateAccount': 'Erreur lors de la création du compte OAuth',
      'EmailCreateAccount': 'Erreur lors de la création du compte email',
      'Callback': 'Erreur lors du callback',
      'OAuthAccountNotLinked': 'Ce compte n\'est pas lié à votre compte existant',
      'EmailSignin': 'Erreur lors de l\'envoi de l\'email de connexion',
      'CredentialsSignup': 'Erreur lors de l\'inscription',
      'SessionRequired': 'Session requise',
    }

    if (typeof error === 'string') {
      setErrorMessage(errorMessages[error] || `Erreur: ${error}`)
    } else {
      setErrorMessage('Une erreur inattendue s\'est produite')
    }
  }, [router.query])

  const handleGoBack = () => {
    router.push('/auth/login')
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Erreur d'authentification</AlertTitle>
            {errorMessage}
          </Alert>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Veuillez vérifier vos informations de connexion et réessayer.
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleGoBack}
            fullWidth
            sx={{ mb: 2 }}
          >
            Retour à la connexion
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => router.push('/')}
            fullWidth
          >
            Retour à l'accueil
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

ErrorPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default ErrorPage
