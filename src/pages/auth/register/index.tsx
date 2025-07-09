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
import CheckCircle from 'mdi-material-ui/CheckCircle'
import CircleOutline from 'mdi-material-ui/CircleOutline'

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
  // TODO: Backend - Décommenter quand le backend sera prêt pour gérer le champ compteOWO
  // compteOWO: string
  showPassword: boolean
  showConfirmPassword: boolean
}

// Constantes pour les validations de sécurité
const VALIDATION_LIMITS = {
  email: { max: 100 },
  FirstName: { max: 50 },
  LastName: { max: 50 },
  Address: { max: 200 },
  Phone: { max: 15 },
  password: { min: 8, max: 128 },
  // TODO: Backend - Décommenter quand le backend sera prêt pour gérer le champ compteOWO
  // compteOWO: { max: 50 }
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
    // TODO: Backend - Décommenter quand le backend sera prêt pour gérer le champ compteOWO
    // compteOWO: '',
    showPassword: false,
    showConfirmPassword: false,
  })
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
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

    // Validation en temps réel du mot de passe
    if (prop === 'password') {
      setPasswordValidation({
        hasMinLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value)
      })
    }
  }

  const handleSelectChange = (prop: keyof State) => (event: any) => {
    const newValue = event.target.value
    
    // TODO: Backend - Décommenter quand le backend sera prêt pour gérer le champ compteOWO
    // Si on change le type de profil vers ACHETEUR, vider le champ compteOWO
    // if (prop === 'profileType' && newValue === 'ACHETEUR') {
    //   setValues({ ...values, [prop]: newValue, compteOWO: '' })
    // } else {
    //   setValues({ ...values, [prop]: newValue })
    // }
    
    // Si on change le pays, mettre à jour le téléphone avec le nouvel indicatif
    if (prop === 'country') {
      const selectedCountry = countries.find(c => c.name === newValue)
      const countryCode = selectedCountry?.phoneCode || ''
      
      // Si il y a déjà un numéro de téléphone, le mettre à jour avec le nouvel indicatif
      let updatedPhone = values.Phone
      if (values.Phone && !values.Phone.startsWith('+')) {
        // Si le téléphone ne commence pas par +, ajouter l'indicatif
        updatedPhone = countryCode + values.Phone
      } else if (values.Phone && values.Phone.startsWith('+')) {
        // Si le téléphone commence par +, remplacer l'ancien indicatif
        const phoneWithoutCode = values.Phone.replace(/^\+\d{1,4}/, '')
        updatedPhone = countryCode + phoneWithoutCode
      }
      
      setValues({ ...values, [prop]: newValue, Phone: updatedPhone })
    } else {
      setValues({ ...values, [prop]: newValue })
    }
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

  // Obtenir l'indicatif du pays sélectionné
  const getCountryCode = () => {
    const selectedCountry = countries.find(c => c.name === values.country)
    return selectedCountry?.phoneCode || ''
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

    // Validation du mot de passe
    if (values.password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères')
    }

    if (!/[A-Z]/.test(values.password)) {
      throw new Error('Le mot de passe doit contenir au moins une majuscule')
    }

    if (!/[a-z]/.test(values.password)) {
      throw new Error('Le mot de passe doit contenir au moins une minuscule')
    }

    if (!/\d/.test(values.password)) {
      throw new Error('Le mot de passe doit contenir au moins un chiffre')
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
        dangerousChars.test(values.Address)) {
      throw new Error('Les caractères spéciaux < > " \' & ne sont pas autorisés')
    }

    // TODO: Backend - Décommenter quand le backend sera prêt pour gérer le champ compteOWO
    // if (values.compteOWO.length > VALIDATION_LIMITS.compteOWO.max) {
    //   throw new Error(`Le compte OWO ne doit pas dépasser ${VALIDATION_LIMITS.compteOWO.max} caractères`)
    // }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      validateForm()

      // Construire le numéro de téléphone complet avec l'indicatif
      const countryCode = getCountryCode()
      const fullPhone = countryCode ? `${countryCode}${values.Phone}` : values.Phone

      const registerData = {
        email: values.email.trim(),
        FirstName: values.FirstName.trim(),
        LastName: values.LastName.trim(),
        Address: values.Address.trim(),
        Phone: fullPhone,
        BirthDate: values.BirthDate,
        profileType: values.profileType,
        password: values.password,
        country: values.country,
        // TODO: Backend - Décommenter quand le backend sera prêt pour gérer le champ compteOWO
        // compteOWO: values.profileType === 'AGRICULTEUR' ? values.compteOWO.trim() || undefined : undefined,
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
              <FormControl sx={{ minWidth: 120, flex: 1 }}>
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
                      {country.name} ({country.phoneCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                sx={{ flex: 2 }}
                id='Phone'
                label='Téléphone *'
                value={values.Phone}
                onChange={handleChange('Phone')}
                disabled={isLoading}
                inputProps={{ maxLength: 15 }}
                helperText={values.country ? `` : 'Sélectionnez d\'abord un pays'}
              />
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

            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                Le mot de passe doit contenir :
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {passwordValidation.hasMinLength ? 
                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> : 
                    <CircleOutline sx={{ fontSize: 16, color: 'text.disabled' }} />
                  }
                  <Typography variant="caption" color={passwordValidation.hasMinLength ? 'success.main' : 'textSecondary'} sx={{ fontWeight: passwordValidation.hasMinLength ? 600 : 400 }}>
                    Au moins 8 caractères
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {passwordValidation.hasUpperCase ? 
                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> : 
                    <CircleOutline sx={{ fontSize: 16, color: 'text.disabled' }} />
                  }
                  <Typography variant="caption" color={passwordValidation.hasUpperCase ? 'success.main' : 'textSecondary'} sx={{ fontWeight: passwordValidation.hasUpperCase ? 600 : 400 }}>
                    Au moins une majuscule
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {passwordValidation.hasLowerCase ? 
                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> : 
                    <CircleOutline sx={{ fontSize: 16, color: 'text.disabled' }} />
                  }
                  <Typography variant="caption" color={passwordValidation.hasLowerCase ? 'success.main' : 'textSecondary'} sx={{ fontWeight: passwordValidation.hasLowerCase ? 600 : 400 }}>
                    Au moins une minuscule
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {passwordValidation.hasNumber ? 
                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> : 
                    <CircleOutline sx={{ fontSize: 16, color: 'text.disabled' }} />
                  }
                  <Typography variant="caption" color={passwordValidation.hasNumber ? 'success.main' : 'textSecondary'} sx={{ fontWeight: passwordValidation.hasNumber ? 600 : 400 }}>
                    Au moins un chiffre
                  </Typography>
                </Box>
              </Box>
            </Box>

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
