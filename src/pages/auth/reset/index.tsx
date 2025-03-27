import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import BlankLayout from 'src/@core/layouts/BlankLayout';
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Link from 'next/link';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    temporaryPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Refs pour les champs de mot de passe
  const temporaryPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handleChange = (prop: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [prop]: event.target.value });
  };

  const togglePasswordVisibility = (field: 'temporary' | 'new' | 'confirm') => {
    if (field === 'temporary') setShowTemporaryPassword(!showTemporaryPassword);
    if (field === 'new') setShowNewPassword(!showNewPassword);
    if (field === 'confirm') setShowConfirmPassword(!showConfirmPassword);
  };

  const isPasswordSecure = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasDigit &&
      hasSpecialChar
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!formData.email) {
      setError("L'email est requis.");
      setIsLoading(false);
      return;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }
    if (!isPasswordSecure(formData.newPassword)) {
      setError(
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://agriconnect-bc17856a61b8.herokuapp.com/users/validate-reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          temporaryPassword: formData.temporaryPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Mot de passe réinitialisé avec succès !');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(data.message || 'Échec de la réinitialisation du mot de passe.');
      }
    } catch (err) {
      setError('Erreur lors de la réinitialisation du mot de passe.');
      console.error(err);
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
            label='Adresse email'
            type='email'
            value={formData.email}
            onChange={handleChange('email')}
            disabled={isLoading}
            sx={{ mb: 4 }}
            required
          />

          <TextField
            fullWidth
            label='Mot de passe temporaire'
            type={showTemporaryPassword ? 'text' : 'password'}
            value={formData.temporaryPassword}
            onChange={handleChange('temporaryPassword')}
            disabled={isLoading}
            sx={{ mb: 4 }}
            required
            inputRef={temporaryPasswordRef}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={() => togglePasswordVisibility('temporary')}
                    edge='end'
                  >
                    {showTemporaryPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label='Nouveau mot de passe'
            type={showNewPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={handleChange('newPassword')}
            disabled={isLoading}
            sx={{ mb: 4 }}
            required
            inputRef={newPasswordRef}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={() => togglePasswordVisibility('new')}
                    edge='end'
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label='Confirmer le nouveau mot de passe'
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmNewPassword}
            onChange={handleChange('confirmNewPassword')}
            disabled={isLoading}
            sx={{ mb: 4 }}
            required
            inputRef={confirmPasswordRef}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={() => togglePasswordVisibility('confirm')}
                    edge='end'
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            size='large'
            type='submit'
            variant='contained'
            disabled={isLoading}
            sx={{ mb: 4 }}
          >
            {isLoading ? <CircularProgress size={24} color='inherit' /> : 'Réinitialiser'}
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

ResetPasswordPage.getLayout = (page: React.ReactNode) => <BlankLayout>{page}</BlankLayout>;

export default ResetPasswordPage;