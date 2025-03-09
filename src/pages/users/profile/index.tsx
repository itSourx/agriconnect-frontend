// pages/profile.tsx
import { useState, useEffect, ChangeEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import api from 'src/api/axiosConfig'

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  margin: '0 auto',
  marginTop: theme.spacing(4)
}))

interface UserData {
  id: string
  FirstName: string
  LastName: string
  email: string
  Phone: string
  Address: string
  Photo: string
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

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchUserData = async () => {
      const userId = session?.user?.id

      if (!userId) {
        router.push('/auth/login')
        return
      }

      try {
        setIsLoading(true)
        console.log(userId)
        const response = await api.get(`https://agriconnect-bc17856a61b8.herokuapp.com/users/${userId}`, {
          headers: {
            Accept: '*/*'
          }
        })
        console.log(response)

        const userFields = response.data.fields
        setUserData({
          id: response.data.id,
          FirstName: userFields.FirstName || '',
          LastName: userFields.LastName || '',
          email: userFields.email || '',
          Phone: userFields.Phone || '',
          Address: userFields.Address || '',
          Photo: userFields.Photo?.[0]?.url || '',
          profileType: userFields.profileType?.[0] || '',
          ProductsName: userFields.ProductsName || [],
          ifu: userFields.ifu || 0,
          raisonSociale: userFields.raisonSociale || '',
          Status: userFields.Status || ''
        })
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

  const handleSave = async () => {
    try {
      const token = session?.accessToken
      const updateData = {
        fields: {
          FirstName: userData.FirstName,
          LastName: userData.LastName,
          email: userData.email,
          Phone: userData.Phone,
          Address: userData.Address,
          raisonSociale: userData.raisonSociale
          // Ne pas inclure password et ifu car ils ne doivent pas être modifiables
        }
      }

      const response = await api.put(
        `https://agriconnect-bc17856a61b8.herokuapp.com/users/${userData.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.status === 200) {
        setIsEditing(false)
        setError(null)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil')
    }
  }

  if (status === 'loading' || isLoading) {
    return <Box sx={{ p: 4 }}>Chargement...</Box>
  }

  return (
    <Box sx={{ padding: 4 }}>
      <StyledCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', mb: 4 }}>
            <Avatar src={userData.Photo || '/images/avatars/1.png'} sx={{ width: 100, height: 100, mb: 2 }} />
            <Typography variant='h5'>{`${userData.FirstName} ${userData.LastName}`}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {userData.profileType}
            </Typography>
          </Box>

          {error && (
            <Typography color='error' sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Grid container spacing={3} sx={{ width: '100%' }}>
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
            <Grid item xs={12}>
              <TextField
                fullWidth
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
              <TextField fullWidth label='IFU' value={userData.ifu || ''} disabled={true} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label='Statut' value={userData.Status || ''} disabled={true} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {isEditing ? (
              <>
                <Button variant='outlined' onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button variant='contained' onClick={handleSave}>
                  Sauvegarder
                </Button>
              </>
            ) : (
              <Button variant='contained' onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
            )}
          </Box>
        </CardContent>
      </StyledCard>
    </Box>
  )
}

export default ProfilePage
