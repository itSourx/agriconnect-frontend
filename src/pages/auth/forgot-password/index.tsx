import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import BlankLayout from 'src/@core/layouts/BlankLayout';
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration';
import Link from 'next/link';
import Image from 'next/image';
import themeConfig from 'src/configs/themeConfig'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!email) {
      setError("L'email est requis.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://agriconnect-bc17856a61b8.herokuapp.com/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Un email de réinitialisation a été envoyé à votre adresse.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(data.message || 'Échec de l\'envoi de l\'email de réinitialisation.');
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi de l\'email de réinitialisation.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className='content-center' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ width: '28rem', p: 6, boxShadow: 5, borderRadius: 1, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                component="img"
                src={themeConfig.logo.src}
                alt={`${themeConfig.templateName} Logo`}
                sx={{
                  width: { xs: '150px', sm: '200px', md: themeConfig.logo.width },
                  height: { xs: 'auto', sm: 'auto', md: themeConfig.logo.height },
                  objectFit: 'contain',
                  maxWidth: '100%'
                }}
              />
            </Box>
          </Box>
          <Typography variant='h5' sx={{ mb: 1.5, fontWeight: 600 }}>
            Réinitialisation du mot de passe
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          {error && <Alert severity='error' sx={{ mb: 4 }}>{error}</Alert>}
          {success && <Alert severity='success' sx={{ mb: 4 }}>{success}</Alert>}

          <Typography variant='body2' sx={{ mb: 4, textAlign: 'center' }}>
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </Typography>

          <TextField
            fullWidth
            label='Adresse email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            sx={{ mb: 4 }}
            required
          />

          <Button
            fullWidth
            size='large'
            type='submit'
            variant='contained'
            disabled={isLoading}
            sx={{ mb: 4 }}
          >
            {isLoading ? <CircularProgress size={24} color='inherit' /> : 'Envoyer le lien'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link href='/auth/login' style={{ textDecoration: 'none', color: 'inherit' }}>
              Retour à la connexion
            </Link>
          </Box>
        </form>
      </Box>
      <FooterIllustrationsV1 />
    </Box>
  );
};

ForgotPasswordPage.getLayout = (page: React.ReactNode) => <BlankLayout>{page}</BlankLayout>;

export default ForgotPasswordPage; 