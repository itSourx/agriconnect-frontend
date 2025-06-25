import { ChangeEvent, MouseEvent, ReactNode, useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled, useTheme } from '@mui/material/styles';
import MuiCard, { CardProps } from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import { Alert } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import EyeOutline from 'mdi-material-ui/EyeOutline';
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline';
import themeConfig from 'src/configs/themeConfig';
import BlankLayout from 'src/@core/layouts/BlankLayout';
import { useAuth } from 'src/hooks/useAuth';

interface State {
  password: string;
  showPassword: boolean;
  email: string;
}

const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' },
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  borderRadius: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const LinkStyled = styled('a')(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const LoginPage = () => {
  const [values, setValues] = useState<State>({
    password: '',
    showPassword: false,
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
    setError(null);
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!values.email || !values.password) {
        throw new Error('Veuillez remplir tous les champs');
      }

      const user = await login(values.email, values.password);
      
      if (!user) {
        throw new Error('Erreur lors de la connexion - Utilisateur non trouvé');
      }

      const profileType = user.profileType?.toUpperCase();
      
      if (!profileType) {
        throw new Error('Type de profil non défini');
      }

      switch (profileType) {
        case 'ACHETEUR':
        case 'USER':
          router.push('/marketplace');
          break;
        case 'AGRICULTEUR':
        case 'SUPPLIER':
          router.push('/dashboard/agriculteur');
          break;
        case 'ADMIN':
        case 'SUPERADMIN':
          router.push('/dashboard/admin');
          break;
        default:
          setError('Type de profil non reconnu');
          router.push('/auth/error');
          break;
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof Error) {
        if (err.message.includes('Email ou mot de passe incorrect')) {
          setError('Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.');
        } else if (err.message.includes('Erreur Configuration')) {
          setError('Une erreur est survenue lors de la connexion.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Une erreur inattendue est survenue. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ padding: (theme) => `${theme.spacing(8, 6, 6)} !important` }}>
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
            <Typography variant='h5' sx={{ mb: 1.5, fontWeight: 600 }}>
              Bienvenue sur AgriConnect
            </Typography>
            <Typography variant='body2'>Veuillez vous connecter à votre compte</Typography>
          </Box>
          <form noValidate autoComplete='off' onSubmit={handleLogin}>
            {error && (
              <Alert 
                severity='error' 
                sx={{ 
                  mb: 4,
                  '& .MuiAlert-message': {
                    fontSize: '0.875rem'
                  }
                }}
              >
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              fullWidth
              id='email'
              label='Email'
              sx={{ marginBottom: 4 }}
              value={values.email}
              onChange={handleChange('email')}
              disabled={isLoading}
            />
            <FormControl fullWidth>
              <InputLabel htmlFor='auth-login-password'>Mot de passe</InputLabel>
              <OutlinedInput
                label='Mot de passe'
                value={values.password}
                id='auth-login-password'
                onChange={handleChange('password')}
                type={values.showPassword ? 'text' : 'password'}
                disabled={isLoading}
                endAdornment={
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      aria-label='toggle password visibility'
                      disabled={isLoading}
                    >
                      {values.showPassword ? <EyeOutline /> : <EyeOffOutline />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            <Box
              sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}
            >
              <p></p>
              <Link href='/auth/forgot-password' style={{ fontSize: '0.875rem', textDecoration: 'none', color: theme.palette.primary.main }}>
                Mot de passe oublié ?
              </Link>
            </Box>
            <Button
              fullWidth
              size='large'
              variant='contained'
              sx={{ marginBottom: 4 }}
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color='inherit' /> : 'Connexion'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

export default LoginPage;