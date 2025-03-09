import { useState, useEffect, ChangeEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import CardContent from '@mui/material/CardContent'
import Button, { ButtonProps } from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { styled } from '@mui/material/styles'
import api from 'src/api/axiosConfig'

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

const ButtonStyled = styled(Button)<ButtonProps & { component?: any; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

interface UserData {
  id: string
  FirstName: string
  LastName: string
  email: string
  Phone: string
  Address: string
  Photo: string | File
  profileType: string
  ProductsName: string[]
  ifu: number
  raisonSociale: string
  Status: string
}

const ProfilePage = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<UserData>({
    id: '',
    FirstName: '',
    LastName: '',
    email: '',
    Phone: '',
    Address: '',
    Photo: '',
    profileType: '',
    ProductsName: [],
    ifu: 0,
    raisonSociale: '',
    Status: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchUserData = async () => {
      const userId = session?.user?.id
      const token = session?.accessToken

      if (!userId || !token) {
        router.push('/auth/login')
        return
      }

      try {
        setIsLoading(true)
        const response = await api.get(`https://agriconnect-bc17856a61b8.herokuapp.com/users/${userId}`, {
          headers: {
            Accept: '*/*',
            Authorization: `Bearer ${token}`
          }
        })

        const userFields = response.data.fields
        const photoUrl = userFields.Photo?.[0]?.url || '/images/avatars/1.png'
        setUserData({
          id: response.data.id,
          FirstName: userFields.FirstName || '',
          LastName: userFields.LastName || '',
          email: userFields.email || '',
          Phone: userFields.Phone || '',
          Address: userFields.Address || '',
          Photo: photoUrl,
          profileType: userFields.profileType?.[0] || '',
          ProductsName: userFields.ProductsName || [],
          ifu: userFields.ifu || 0,
          raisonSociale: userFields.raisonSociale || '',
          Status: userFields.Status || ''
        })
        setImgSrc(photoUrl)
      } catch (err) {
        setError('Erreur lors de la récupération des données utilisateur')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router, session, status])

  const handleChange = (field: keyof UserData) => (event: ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [field]: event.target.value })
  }

  const handlePhotoChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(files[0])
      setUserData({ ...userData, Photo: files[0] })
    }
  }

  const handleSave = async () => {
    try {
      const token = session?.accessToken
      const formData = new FormData()
      formData.append('fields[FirstName]', userData.FirstName)
      formData.append('fields[LastName]', userData.LastName)
      formData.append('fields[email]', userData.email)
      formData.append('fields[Phone]', userData.Phone || '')
      formData.append('fields[Address]', userData.Address || '')
      formData.append('fields[raisonSociale]', userData.raisonSociale || '')
      if (userData.Photo && typeof userData.Photo !== 'string') {
        formData.append('fields[Photo]', userData.Photo)
      }

      const response = await api.put(
        `https://agriconnect-bc17856a61b8.herokuapp.com/users/${userData.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.status === 200) {
        setIsEditing(false)
        setError(null)
        setImgSrc(userData.Photo instanceof File ? URL.createObjectURL(userData.Photo) : userData.Photo)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil')
      console.error(err)
    }
  }

  if (status === 'loading' || isLoading) {
    return <Box sx={{ p: 4 }}>Chargement...</Box>
  }

  return (
    <CardContent>
      <form>
        <Grid container spacing={7}>
          <Grid item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ImgStyled src={imgSrc} alt='Photo de profil' />
              {isEditing && (
                <Box>
                  <ButtonStyled component='label' variant='contained' htmlFor='profile-upload-image'>
                    Changer la photo
                    <input
                      hidden
                      type='file'
                      onChange={handlePhotoChange}
                      accept='image/png, image/jpeg'
                      id='profile-upload-image'
                    />
                  </ButtonStyled>
                  <ResetButtonStyled color='error' variant='outlined' onClick={() => setImgSrc('/images/avatars/1.png')}>
                    Réinitialiser
                  </ResetButtonStyled>
                  <Typography variant='body2' sx={{ marginTop: 5 }}>
                    PNG ou JPEG autorisés. Taille max : 800 Ko.
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {error && (
            <Grid item xs={12} sx={{ mb: 3 }}>
              <Alert severity='error'>
                <AlertTitle>Erreur</AlertTitle>
                {error}
              </Alert>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Prénom'
              value={userData.FirstName}
              onChange={handleChange('FirstName')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Nom'
              value={userData.LastName}
              onChange={handleChange('LastName')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='email'
              label='Email'
              value={userData.email}
              onChange={handleChange('email')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Téléphone'
              value={userData.Phone || ''}
              onChange={handleChange('Phone')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Adresse'
              value={userData.Address || ''}
              onChange={handleChange('Address')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Raison Sociale'
              value={userData.raisonSociale || ''}
              onChange={handleChange('raisonSociale')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='IFU' value={userData.ifu || ''} disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Statut' value={userData.Status || ''} disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Type de profil' value={userData.profileType || ''} disabled />
          </Grid>

          <Grid item xs={12}>
            {isEditing ? (
              <>
                <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSave}>
                  Sauvegarder
                </Button>
                <Button variant='outlined' color='secondary' onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
              </>
            ) : (
              <Button variant='contained' onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
            )}
          </Grid>
        </Grid>
      </form>
    </CardContent>
  )
}

export default ProfilePage