// ** React Imports
import { ChangeEvent, MouseEvent, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from 'src/configs/constants'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar from '@mui/material/Snackbar'

// ** Icons Imports
import EyeOutline from 'mdi-material-ui/EyeOutline'
import KeyOutline from 'mdi-material-ui/KeyOutline'
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline'
import LockOpenOutline from 'mdi-material-ui/LockOpenOutline'

// ** API Import
import api from 'src/api/axiosConfig'

interface State {
  newPassword: string
  oldPassword: string
  showNewPassword: boolean
  confirmNewPassword: string
  showOldPassword: boolean
  showConfirmNewPassword: boolean
}

const TabSecurity = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ** States
  const [values, setValues] = useState<State>({
    newPassword: '',
    oldPassword: '',
    showNewPassword: false,
    confirmNewPassword: '',
    showOldPassword: false,
    showConfirmNewPassword: false
  })

  // Handle Old Password
  const handleOldPasswordChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }
  const handleClickShowOldPassword = () => {
    setValues({ ...values, showOldPassword: !values.showOldPassword })
  }
  const handleMouseDownOldPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  // Handle New Password
  const handleNewPasswordChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }
  const handleClickShowNewPassword = () => {
    setValues({ ...values, showNewPassword: !values.showNewPassword })
  }
  const handleMouseDownNewPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  // Handle Confirm New Password
  const handleConfirmNewPasswordChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }
  const handleClickShowConfirmNewPassword = () => {
    setValues({ ...values, showConfirmNewPassword: !values.showConfirmNewPassword })
  }
  const handleMouseDownConfirmNewPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const validateForm = () => {
    if (!values.oldPassword) {
      setError('Le mot de passe actuel est requis')
      return false
    }
    if (!values.newPassword) {
      setError('Le nouveau mot de passe est requis')
      return false
    }
    if (values.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return false
    }
    if (values.newPassword !== values.confirmNewPassword) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const response = await api.put(
        `/users/change-password/${session?.user?.id}`,
        {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword
        },
        {
          headers: {
            Authorization: `bearer ${session?.accessToken}`,
          },
        }
      )

      if (response.status === 200) {
        setSuccess('Mot de passe modifié avec succès')
        setValues({
          newPassword: '',
          oldPassword: '',
          showNewPassword: false,
          confirmNewPassword: '',
          showOldPassword: false,
          showConfirmNewPassword: false
        })
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la modification du mot de passe')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setError(null)
    setSuccess(null)
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <CardContent sx={{ paddingBottom: 0 }}>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={6}>
            <Grid container spacing={5}>
              <Grid item xs={12} sx={{ marginTop: 4.75 }}>
                <FormControl fullWidth>
                  <InputLabel htmlFor='account-settings-current-password'>Mot de passe actuel</InputLabel>
                  <OutlinedInput
                    label='Mot de passe actuel'
                    value={values.oldPassword}
                    id='account-settings-current-password'
                    type={values.showOldPassword ? 'text' : 'password'}
                    onChange={handleOldPasswordChange('oldPassword')}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          aria-label='toggle password visibility'
                          onClick={handleClickShowOldPassword}
                          onMouseDown={handleMouseDownOldPassword}
                        >
                          {values.showOldPassword ? <EyeOutline /> : <EyeOffOutline />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sx={{ marginTop: 6 }}>
                <FormControl fullWidth>
                  <InputLabel htmlFor='account-settings-new-password'>Nouveau mot de passe</InputLabel>
                  <OutlinedInput
                    label='Nouveau mot de passe'
                    value={values.newPassword}
                    id='account-settings-new-password'
                    onChange={handleNewPasswordChange('newPassword')}
                    type={values.showNewPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowNewPassword}
                          aria-label='toggle password visibility'
                          onMouseDown={handleMouseDownNewPassword}
                        >
                          {values.showNewPassword ? <EyeOutline /> : <EyeOffOutline />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel htmlFor='account-settings-confirm-new-password'>Confirmer le nouveau mot de passe</InputLabel>
                  <OutlinedInput
                    label='Confirmer le nouveau mot de passe'
                    value={values.confirmNewPassword}
                    id='account-settings-confirm-new-password'
                    type={values.showConfirmNewPassword ? 'text' : 'password'}
                    onChange={handleConfirmNewPasswordChange('confirmNewPassword')}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          aria-label='toggle password visibility'
                          onClick={handleClickShowConfirmNewPassword}
                          onMouseDown={handleMouseDownConfirmNewPassword}
                        >
                          {values.showConfirmNewPassword ? <EyeOutline /> : <EyeOffOutline />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid
            item
            sm={6}
            xs={12}
            sx={{ display: 'flex', marginTop: [7.5, 2.5], alignItems: 'center', justifyContent: 'center' }}
          >
            <img width={183} alt='avatar' height={256} src='/images/pages/pose-m-1.png' />
          </Grid>
        </Grid>
      </CardContent>

      <Divider sx={{ margin: 0 }} />

      <CardContent>
        <Box sx={{ mt: 1.75, display: 'flex', alignItems: 'center' }}>
          <KeyOutline sx={{ marginRight: 3 }} />
          <Typography variant='h6'>Authentification à deux facteurs</Typography>
        </Box>

        <Box sx={{ mt: 5.75, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              maxWidth: 368,
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              flexDirection: 'column'
            }}
          >
            <Avatar
              variant='rounded'
              sx={{ width: 48, height: 48, color: 'common.white', backgroundColor: 'primary.main' }}
            >
              <LockOpenOutline sx={{ fontSize: '1.75rem' }} />
            </Avatar>
            <Typography sx={{ fontWeight: 600, marginTop: 3.5, marginBottom: 3.5 }}>
              L'authentification à deux facteurs n'est pas encore activée.
            </Typography>
            <Typography variant='body2'>
              L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte en exigeant plus qu'un simple mot de passe pour se connecter.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 11 }}>
          <Button 
            variant='contained' 
            sx={{ marginRight: 3.5 }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Modification...' : 'Enregistrer les modifications'}
          </Button>
          <Button
            type='reset'
            variant='outlined'
            color='secondary'
            onClick={() => setValues({ ...values, oldPassword: '', newPassword: '', confirmNewPassword: '' })}
            disabled={isLoading}
          >
            Réinitialiser
          </Button>
        </Box>
      </CardContent>

      <Snackbar 
        open={!!error || !!success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {error ? (
          <Alert severity="error" onClose={handleCloseSnackbar}>
            <AlertTitle>Erreur</AlertTitle>
            {error}
          </Alert>
        ) : (
          <Alert severity="success" onClose={handleCloseSnackbar}>
            <AlertTitle>Succès</AlertTitle>
            {success}
          </Alert>
        )}
      </Snackbar>
    </form>
  )
}

export default TabSecurity
