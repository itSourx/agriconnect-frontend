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

const ResetPasswordPage = () => {
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (prop: keyof typeof passwordData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [prop]: event.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setError('Le mot de passe doit comporter au moins 8 caractères.');
      setIsLoading(false);
      return;
    }

    try {
      // Assurez-vous que l'URL contient le token de réinitialisation
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        throw new Error('Token de réinitialisation manquant.');
      }

      const response = await fetch('https://agriconnect-bc17856a61b8.herokuapp.com/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: passwordData.newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Mot de passe réinitialisé avec succès !');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message || 'Échec de la réinitialisation du mot de passe.');
      }
    } catch (err) {
      setError('Erreur lors de la réinitialisation du mot de passe.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className='content-center' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ width: '28rem', p: 6, boxShadow: 5, borderRadius: 1, bgcolor: 'background.paper' }}>
        <Typography variant='h5' sx={{ mb: 4, textAlign: 'center' }}>
          Réinitialiser le mot de passe
        </Typography>
        <form onSubmit={handleSubmit}>
          {error && <Alert severity='error' sx={{ mb: 4 }}>{error}</Alert>}
          {success && <Alert severity='success' sx={{ mb: 4 }}>{success}</Alert>}
          <TextField
            fullWidth
            label='Nouveau mot de passe'
            type='password'
            value={passwordData.newPassword}
            onChange={handleChange('newPassword')}
            disabled={isLoading}
            sx={{ mb: 4 }}
          />
          <TextField
            fullWidth
            label='Confirmer le nouveau mot de passe'
            type='password'
            value={passwordData.confirmNewPassword}
            onChange={handleChange('confirmNewPassword')}
            disabled={isLoading}
            sx={{ mb: 4 }}
          />
          <Button
            fullWidth
            type='submit'
            variant='contained'
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color='inherit' /> : 'Réinitialiser'}
          </Button>
        </form>
      </Box>
      <FooterIllustrationsV1 />
    </Box>
  );
};

ResetPasswordPage.getLayout = (page: React.ReactNode) => <BlankLayout>{page}</BlankLayout>;

export default ResetPasswordPage;
