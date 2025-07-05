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
import CircularProgress from '@mui/material/CircularProgress'

// ** Icons Imports
import EyeOutline from 'mdi-material-ui/EyeOutline'
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline'

// ** Configs
import themeConfig from 'src/configs/themeConfig'
import { API_BASE_URL } from 'src/configs/constants'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Utils
import { countries } from 'src/utils/countries'

// ** Third Party Imports
import { toast } from 'react-hot-toast'

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

// Constantes pour les validations de sécurité
const VALIDATION_LIMITS = {
  email: { max: 100 },
  FirstName: { max: 50 },
  LastName: { max: 50 },
  Address: { max: 200 },
  Phone: { max: 20 },
  password: { min: 6, max: 128 },
  compteOWO: { max: 50 }
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
  const [isLoading, setIsLoading] = useState(false)
  const theme = useTheme()
  const router = useRouter()

  const handleChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const limit = VALIDATION_LIMITS[prop as keyof typeof VALIDATION_LIMITS]
    
    // Vérifier la limite de caractères
    if (limit?.max && value.length > limit.max) {
      return // Ne pas mettre à jour si la limite est dépassée
    }
    
    setValues({ ...values, [prop]: value })
  }

  const handleSelectChange = (prop: keyof State) => (event: any) => {
    setValues({ ...values, [prop]: event.target.value })
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
    // Vérification des champs requis
    if (!values.email || !values.FirstName || !values.LastName || !values.Address || 
        !values.Phone || !values.BirthDate || !values.profileType || !values.password || 
        !values.confirmPassword || !values.country) {
      throw new Error('Veuillez remplir tous les champs obligatoires')
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(values.email)) {
      throw new Error('Veuillez entrer une adresse email valide')
    }

    // Validation de la longueur des champs
    if (values.email.length > VALIDATION_LIMITS.email.max) {
      throw new Error(`L'email ne doit pas dépasser ${VALIDATION_LIMITS.email.max} caractères`)
    }

    if (values.FirstName.length > VALIDATION_LIMITS.FirstName.max) {
      throw new Error(`Le prénom ne doit pas dépasser ${VALIDATION_LIMITS.FirstName.max} caractères`)
    }

    if (values.LastName.length > VALIDATION_LIMITS.LastName.max) {
      throw new Error(`Le nom ne doit pas dépasser ${VALIDATION_LIMITS.LastName.max} caractères`)
    }

    if (values.Address.length > VALIDATION_LIMITS.Address.max) {
      throw new Error(`L'adresse ne doit pas dépasser ${VALIDATION_LIMITS.Address.max} caractères`)
    }

    if (values.Phone.length > VALIDATION_LIMITS.Phone.max) {
      throw new Error(`Le téléphone ne doit pas dépasser ${VALIDATION_LIMITS.Phone.max} caractères`)
    }

    if (values.compteOWO.length > VALIDATION_LIMITS.compteOWO.max) {
      throw new Error(`Le compte OWO ne doit pas dépasser ${VALIDATION_LIMITS.compteOWO.max} caractères`)
    }

    // Validation du mot de passe
    if (values.password.length < VALIDATION_LIMITS.password.min) {
      throw new Error(`Le mot de passe doit contenir au moins ${VALIDATION_LIMITS.password.min} caractères`)
    }

    if (values.password.length > VALIDATION_LIMITS.password.max) {
      throw new Error(`Le mot de passe ne doit pas dépasser ${VALIDATION_LIMITS.password.max} caractères`)
    }

    if (values.password !== values.confirmPassword) {
      throw new Error('Les mots de passe ne correspondent pas')
    }

    // Validation de la date de naissance
    const birthDate = new Date(values.BirthDate)
    const today = new Date()
    if (birthDate >= today) {
      throw new Error('La date de naissance doit être dans le passé')
    }

    // Validation de l'âge minimum (18 ans)
    const minAge = new Date()
    minAge.setFullYear(minAge.getFullYear() - 18)
    if (birthDate > minAge) {
      throw new Error('Vous devez avoir au moins 18 ans pour vous inscrire')
    }

    // Validation du téléphone (format basique)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/
    if (!phoneRegex.test(values.Phone)) {
      throw new Error('Veuillez entrer un numéro de téléphone valide')
    }

    // Validation des caractères spéciaux dangereux
    const dangerousChars = /[<>\"'&]/
    if (dangerousChars.test(values.FirstName) || dangerousChars.test(values.LastName) || 
        dangerousChars.test(values.Address) || dangerousChars.test(values.compteOWO)) {
      throw new Error('Les caractères spéciaux < > " \' & ne sont pas autorisés')
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      validateForm()

      const registerData = {
        email: values.email.trim(),
        FirstName: values.FirstName.trim(),
        LastName: values.LastName.trim(),
        Address: values.Address.trim(),
        Phone: values.Phone.trim(),
        BirthDate: values.BirthDate,
        profileType: values.profileType,
        password: values.password,
        country: values.country,
        compteOWO: values.compteOWO.trim() || undefined, // Optionnel
      }

      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: JSON.stringify(registerData),
      })

      const responseText = await response.text()
      let responseData

      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = { message: responseText }
      }

      if (!response.ok) {
        // Afficher le message d'erreur exact du backend
        const errorMessage = responseData.message || responseData.error || 'Erreur lors de l\'inscription'
        throw new Error(errorMessage)
      }

      toast.success('Inscription réussie ! Redirection vers la page de connexion...')
      
      // Redirection vers login après 2 secondes
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)

    } catch (err) {
      console.error("Register error:", err)
      if (err instanceof Error) {
        toast.error(err.message)
      } else {
        toast.error('Une erreur inattendue est survenue. Veuillez réessayer.')
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
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <TextField
                fullWidth
                id='FirstName'
                label='Prénom *'
                value={values.FirstName}
                onChange={handleChange('FirstName')}
                disabled={isLoading}
                inputProps={{ maxLength: VALIDATION_LIMITS.FirstName.max }}
              />
              <TextField
                fullWidth
                id='LastName'
                label='Nom *'
                value={values.LastName}
                onChange={handleChange('LastName')}
                disabled={isLoading}
                inputProps={{ maxLength: VALIDATION_LIMITS.LastName.max }}
              />
            </Box>

            <TextField
              fullWidth
              id='email'
              label='Email *'
              type='email'
              sx={{ marginBottom: 4 }}
              value={values.email}
              onChange={handleChange('email')}
              disabled={isLoading}
              inputProps={{ maxLength: VALIDATION_LIMITS.email.max }}
            />

            <TextField
              fullWidth
              id='Address'
              label='Adresse *'
              sx={{ marginBottom: 4 }}
              value={values.Address}
              onChange={handleChange('Address')}
              disabled={isLoading}
              inputProps={{ maxLength: VALIDATION_LIMITS.Address.max }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <TextField
                fullWidth
                id='Phone'
                label='Téléphone *'
                value={values.Phone}
                onChange={handleChange('Phone')}
                disabled={isLoading}
                inputProps={{ maxLength: VALIDATION_LIMITS.Phone.max }}
              />
              <FormControl fullWidth>
                <InputLabel id='country-label'>Pays *</InputLabel>
                <Select
                  labelId='country-label'
                  value={values.country}
                  onChange={handleSelectChange('country')}
                  label='Pays *'
                  disabled={isLoading}
                >
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.name}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              id='BirthDate'
              label='Date de naissance *'
              type='date'
              sx={{ marginBottom: 4 }}
              value={values.BirthDate}
              onChange={handleChange('BirthDate')}
              disabled={isLoading}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              }}
            />

            <FormControl fullWidth sx={{ marginBottom: 4 }}>
              <InputLabel id='profileType-label'>Type de profil *</InputLabel>
              <Select
                labelId='profileType-label'
                value={values.profileType}
                onChange={handleSelectChange('profileType')}
                label='Type de profil *'
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
                label='Compte OWO (optionnel)'
                sx={{ marginBottom: 4 }}
                value={values.compteOWO}
                onChange={handleChange('compteOWO')}
                disabled={isLoading}
                inputProps={{ maxLength: VALIDATION_LIMITS.compteOWO.max }}
                helperText="Compte OWO optionnel pour les agriculteurs"
              />
            )}

            <FormControl fullWidth sx={{ marginBottom: 4 }}>
              <InputLabel htmlFor='auth-register-password'>Mot de passe *</InputLabel>
              <OutlinedInput
                label='Mot de passe *'
                value={values.password}
                id='auth-register-password'
                onChange={handleChange('password')}
                type={values.showPassword ? 'text' : 'password'}
                disabled={isLoading}
                inputProps={{ 
                  maxLength: VALIDATION_LIMITS.password.max,
                  minLength: VALIDATION_LIMITS.password.min
                }}
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
              <InputLabel htmlFor='auth-register-confirm-password'>Confirmer le mot de passe *</InputLabel>
              <OutlinedInput
                label='Confirmer le mot de passe *'
                value={values.confirmPassword}
                id='auth-register-confirm-password'
                onChange={handleChange('confirmPassword')}
                type={values.showConfirmPassword ? 'text' : 'password'}
                disabled={isLoading}
                inputProps={{ 
                  maxLength: VALIDATION_LIMITS.password.max,
                  minLength: VALIDATION_LIMITS.password.min
                }}
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
