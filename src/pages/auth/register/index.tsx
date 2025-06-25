// ** React Imports
import { ChangeEvent, MouseEvent, ReactNode, useState, FormEvent } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { styled, useTheme } from '@mui/material/styles'
import MuiCard, { CardProps } from '@mui/material/Card'
import InputAdornment from '@mui/material/InputAdornment'
import { Alert } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icons Imports
import EyeOutline from 'mdi-material-ui/EyeOutline'
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '32rem' },
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  borderRadius: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}))

interface State {
  email: string
  FirstName: string
  LastName: string
  Address: string
  Phone: string
  BirthDate: string
  profileType: string
  password: string
  confirmPassword: string
  country: string
  compteOWO: string
  showPassword: boolean
  showConfirmPassword: boolean
}

const RegisterPage = () => {
  const [values, setValues] = useState<State>({
    email: '',
    FirstName: '',
    LastName: '',
    Address: '',
    Phone: '',
    BirthDate: '',
    profileType: '',
    password: '',
    confirmPassword: '',
    country: '',
    compteOWO: '',
    showPassword: false,
    showConfirmPassword: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const theme = useTheme()
  const router = useRouter()

  const handleChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
    setError(null)
    setSuccess(null)
  }

  const handleSelectChange = (prop: keyof State) => (event: any) => {
    setValues({ ...values, [prop]: event.target.value })
    setError(null)
    setSuccess(null)
  }

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }

  const handleClickShowConfirmPassword = () => {
    setValues({ ...values, showConfirmPassword: !values.showConfirmPassword })
  }

  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const validateForm = () => {
    if (!values.email || !values.FirstName || !values.LastName || !values.Address || 
        !values.Phone || !values.BirthDate || !values.profileType || !values.password || 
        !values.confirmPassword || !values.country) {
      throw new Error('Veuillez remplir tous les champs')
    }

    // Vérifier le compte OWO seulement pour les agriculteurs
    if (values.profileType === 'AGRICULTEUR' && !values.compteOWO) {
      throw new Error('Le compte OWO est requis pour les agriculteurs')
    }

    if (values.password !== values.confirmPassword) {
      throw new Error('Les mots de passe ne correspondent pas')
    }

    if (values.password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(values.email)) {
      throw new Error('Veuillez entrer une adresse email valide')
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      validateForm()

      const registerData = {
        email: values.email,
        FirstName: values.FirstName,
        LastName: values.LastName,
        Address: values.Address,
        Phone: values.Phone,
        BirthDate: values.BirthDate,
        profileType: values.profileType,
        password: values.password,
        country: values.country,
        compteOWO: values.compteOWO,
      }

      const response = await fetch('https://agriconnect-bc17856a61b8.herokuapp.com/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: JSON.stringify(registerData),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || 'Erreur lors de l\'inscription')
      }

      setSuccess('Inscription réussie ! Redirection vers la page de connexion...')
      
      // Redirection vers login après 2 secondes
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)

    } catch (err) {
      console.error("Register error:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Une erreur inattendue est survenue. Veuillez réessayer.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 2,
        backgroundColor: '#f5f5f5',
      }}
    >
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ padding: (theme) => `${theme.spacing(6, 4, 4)} !important` }}>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                component="img"
                src={themeConfig.logo.src}
                alt={`${themeConfig.templateName} Logo`}
                sx={{
                  width: { xs: '120px', sm: '150px' },
                  height: 'auto',
                  objectFit: 'contain',
                  maxWidth: '100%'
                }}
              />
            </Box>
            <Typography variant='h5' sx={{ mb: 1, fontWeight: 600 }}>
              Créer un compte
            </Typography>
          </Box>

          <form noValidate autoComplete='off' onSubmit={handleRegister}>
            {error && (
              <Alert 
                severity='error' 
                sx={{ 
                  mb: 3,
                  '& .MuiAlert-message': {
                    fontSize: '0.875rem'
                  }
                }}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert 
                severity='success' 
                sx={{ 
                  mb: 3,
                  '& .MuiAlert-message': {
                    fontSize: '0.875rem'
                  }
                }}
              >
                {success}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <TextField
                fullWidth
                id='FirstName'
                label='Prénom'
                value={values.FirstName}
                onChange={handleChange('FirstName')}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                id='LastName'
                label='Nom'
                value={values.LastName}
                onChange={handleChange('LastName')}
                disabled={isLoading}
              />
            </Box>

            <TextField
              fullWidth
              id='email'
              label='Email'
              type='email'
              sx={{ marginBottom: 4 }}
              value={values.email}
              onChange={handleChange('email')}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              id='Address'
              label='Adresse'
              sx={{ marginBottom: 4 }}
              value={values.Address}
              onChange={handleChange('Address')}
              disabled={isLoading}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <TextField
                fullWidth
                id='Phone'
                label='Téléphone'
                value={values.Phone}
                onChange={handleChange('Phone')}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                id='country'
                label='Pays'
                value={values.country}
                onChange={handleChange('country')}
                disabled={isLoading}
              />
            </Box>

            <TextField
              fullWidth
              id='BirthDate'
              label='Date de naissance'
              type='date'
              sx={{ marginBottom: 4 }}
              value={values.BirthDate}
              onChange={handleChange('BirthDate')}
              disabled={isLoading}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth sx={{ marginBottom: 4 }}>
              <InputLabel id='profileType-label'>Type de profil</InputLabel>
              <Select
                labelId='profileType-label'
                value={values.profileType}
                onChange={handleSelectChange('profileType')}
                label='Type de profil'
                disabled={isLoading}
              >
                <MenuItem value='ACHETEUR'>Acheteur</MenuItem>
                <MenuItem value='AGRICULTEUR'>Agriculteur</MenuItem>
              </Select>
            </FormControl>

            {values.profileType === 'AGRICULTEUR' && (
              <TextField
                fullWidth
                id='compteOWO'
                label='Compte OWO'
                sx={{ marginBottom: 4 }}
                value={values.compteOWO}
                onChange={handleChange('compteOWO')}
                disabled={isLoading}
                helperText='Numéro de compte OWO requis pour les agriculteurs'
              />
            )}

            <FormControl fullWidth sx={{ marginBottom: 4 }}>
              <InputLabel htmlFor='auth-register-password'>Mot de passe</InputLabel>
              <OutlinedInput
                label='Mot de passe'
                value={values.password}
                id='auth-register-password'
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

            <FormControl fullWidth sx={{ marginBottom: 4 }}>
              <InputLabel htmlFor='auth-register-confirm-password'>Confirmer le mot de passe</InputLabel>
              <OutlinedInput
                label='Confirmer le mot de passe'
                value={values.confirmPassword}
                id='auth-register-confirm-password'
                onChange={handleChange('confirmPassword')}
                type={values.showConfirmPassword ? 'text' : 'password'}
                disabled={isLoading}
                endAdornment={
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={handleMouseDownPassword}
                      aria-label='toggle confirm password visibility'
                      disabled={isLoading}
                    >
                      {values.showConfirmPassword ? <EyeOutline /> : <EyeOffOutline />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>

            <Button
              fullWidth
              size='large'
              variant='contained'
              sx={{ marginBottom: 3 }}
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color='inherit' /> : 'Créer un compte'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='body2' sx={{ mb: 1 }}>
                Déjà un compte ?
              </Typography>
              <Link href='/auth/login' style={{ fontSize: '0.875rem', textDecoration: 'none', color: theme.palette.primary.main }}>
                Se connecter
              </Link>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

RegisterPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default RegisterPage
