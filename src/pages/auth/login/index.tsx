import { ChangeEvent, MouseEvent, ReactNode, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
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
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel';
import { Alert, AlertTitle } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Google from 'mdi-material-ui/Google';
import Github from 'mdi-material-ui/Github';
import Twitter from 'mdi-material-ui/Twitter';
import Facebook from 'mdi-material-ui/Facebook';
import EyeOutline from 'mdi-material-ui/EyeOutline';
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline';
import themeConfig from 'src/configs/themeConfig';
import BlankLayout from 'src/@core/layouts/BlankLayout';
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration';
import { signIn } from 'next-auth/react';

interface State {
  password: string;
  showPassword: boolean;
  email: string;
}

const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' },
  boxShadow: theme.shadows[5],
  borderRadius: theme.shape.borderRadius,
}));

const LinkStyled = styled('a')(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const FormControlLabel = styled(MuiFormControlLabel)<FormControlLabelProps>(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
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

  const handleChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    try {
      console.log("Calling signIn with:", { email: values.email, password: values.password });
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });
  
      console.log("signIn result:", result);
      if (result?.error) {
        throw new Error(result.error);
      }
  
      // Récupérer la session pour obtenir profileType
      const sessionResponse = await fetch('/api/auth/session');
      const session = await sessionResponse.json();
      console.log("Session after signIn:", session);
  
      if (!session?.user) {
        throw new Error("Utilisateur non trouvé dans la session");
      }
  
      const profileType = session.user.profileType?.toUpperCase();
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
          router.push('/');
          break;
        default:
          setError('Type de profil non reconnu');
          router.push('/auth/error');
          break;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      className='content-center'
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ padding: (theme) => `${theme.spacing(8, 6, 6)} !important` }}>
          <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <svg width={40} height={34} version='1.1' viewBox='0 0 30 23' xmlns='http://www.w3.org/2000/svg'>
              {/* SVG content remains the same, omitted for brevity */}
            </svg>
            <Typography
              variant='h5'
              sx={{ mt: 2, lineHeight: 1, fontWeight: 700, textTransform: 'uppercase', fontSize: '1.75rem !important' }}
            >
              {themeConfig.templateName}
            </Typography>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant='h6' sx={{ fontWeight: 600, marginBottom: 1.5 }}>
              Bienvenue sur {themeConfig.templateName}! 👋🏻
            </Typography>
            <Typography variant='body2'>Veuillez vous connecter pour commencer</Typography>
          </Box>
          <form noValidate autoComplete='off' onSubmit={handleLogin}>
            {error && (
              <Alert severity='error' sx={{ mb: 4 }}>
                <AlertTitle>Erreur</AlertTitle>
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
            <Divider sx={{ mb: 4 }}>ou</Divider>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton href='/auth/google' aria-label='Google'>
                <Google />
              </IconButton>
              <IconButton href='/auth/github' aria-label='GitHub'>
                <Github />
              </IconButton>
              <IconButton href='/auth/twitter' aria-label='Twitter'>
                <Twitter />
              </IconButton>
              <IconButton href='/auth/facebook' aria-label='Facebook'>
                <Facebook />
              </IconButton>
            </Box>
          </form>
        </CardContent>
      </Card>
      <FooterIllustrationsV1 />
    </Box>
  );
};

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;

export default LoginPage;