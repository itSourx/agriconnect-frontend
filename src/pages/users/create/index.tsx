// pages/users/create.tsx
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { styled } from '@mui/material/styles'
import api from 'src/api/axiosConfig'

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(4)
}))

interface NewUser {
  email: string
  FirstName: string
  LastName: string
  Phone?: string
  Address?: string
  raisonSociale?: string
  password: string
  profileType: string[]
  Photo?: File | null
  BirthDate?: string
  ifu?: number
}

const CreateUserPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    FirstName: '',
    LastName: '',
    Phone: '',
    Address: '',
    raisonSociale: '',
    password: '',
    profileType: ['USER']
  })
  const [error, setError] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<{ id: string; Type: string }[]>([]);

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchProfiles = async () => {
      const token = session?.accessToken
      if (!token) return

      try {
        const response = await api.get('https://agriconnect-bc17856a61b8.herokuapp.com/profiles', {
          headers: {
            Accept: '*/*',
            Authorization: `Bearer ${token}`
          }
        })
        setProfiles(
          response.data.map((profile: any) => ({
            id: profile.id,
            Type: profile.fields.Type
          }))
        )
      } catch (err) {
        console.error('Erreur lors de la récupération des profils:', err)
      }
    }

    fetchProfiles()
  }, [status, router, session])

  // Gérer les changements dans les champs
  const handleChange = (field: keyof NewUser) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'ifu' ? Number(event.target.value) : event.target.value // Convertir ifu en nombre
    setNewUser({
      ...newUser,
      [field]: value
    })
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setNewUser({
      ...newUser,
      Photo: file || null
    })
  }

  // Créer un nouvel utilisateur
  const handleCreate = async () => {
    const token = session?.accessToken
    if (!token) {
      setError('Veuillez vous connecter pour créer un utilisateur.')
      return
    }

    try {
      const formData = new FormData()
      formData.append('fields[email]', newUser.email)
      formData.append('fields[FirstName]', newUser.FirstName)
      formData.append('fields[LastName]', newUser.LastName)
      if (newUser.Phone) formData.append('fields[Phone]', newUser.Phone)
      if (newUser.Address) formData.append('fields[Address]', newUser.Address)
      if (newUser.raisonSociale) formData.append('fields[raisonSociale]', newUser.raisonSociale)
      formData.append('fields[password]', newUser.password)
      formData.append('fields[profileType][0]', newUser.profileType[0]) // Envoie le premier profileType
      formData.append('fields[Status]', 'Activated')
      if (newUser.BirthDate) formData.append('fields[BirthDate]', newUser.BirthDate)
      if (newUser.ifu) formData.append('fields[ifu]', newUser.ifu.toString())
      if (newUser.Photo) formData.append('fields[Photo]', newUser.Photo)

      const response = await api.post('https://agriconnect-bc17856a61b8.herokuapp.com/users', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // Pour gérer la photo
        }
      })

      if (response.status === 201) {
        router.push('/users/manage')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l’utilisateur')
      console.error(err)
    }
  }

  if (status === 'loading') {
    return <Box sx={{ p: 4 }}>Chargement...</Box>
  }

  return (
    <Box sx={{ padding: 4 }}>
      <StyledCard>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            Créer un nouvel utilisateur
          </Typography>
          {error && (
            <Typography color='error' sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Prénom'
                value={newUser.FirstName}
                onChange={handleChange('FirstName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label='Nom' value={newUser.LastName} onChange={handleChange('LastName')} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label='Email' value={newUser.email} onChange={handleChange('email')} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label='Téléphone' value={newUser.Phone || ''} onChange={handleChange('Phone')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label='Adresse' value={newUser.Address || ''} onChange={handleChange('Address')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Raison Sociale'
                value={newUser.raisonSociale || ''}
                onChange={handleChange('raisonSociale')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Mot de passe'
                type='password'
                value={newUser.password}
                onChange={handleChange('password')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Date de naissance'
                type='date'
                value={newUser.BirthDate || ''}
                onChange={handleChange('BirthDate')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label='IFU' type='number' value={newUser.ifu || ''} onChange={handleChange('ifu')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Profil</InputLabel>
                <Select
                  value={newUser.profileType[0] || ''}
                  onChange={e => setNewUser({ ...newUser, profileType: [e.target.value as string] })}
                  label='Profil'
                >
                  {profiles.map(profile => (
                    <MenuItem key={profile.id} value={profile.Type}>
                      {profile.Type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Photo'
                type='file'
                onChange={handlePhotoChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant='outlined' onClick={() => router.push('/users/manage')}>
              Annuler
            </Button>
            <Button variant='contained' onClick={handleCreate}>
              Créer
            </Button>
          </Box>
        </CardContent>
      </StyledCard>
    </Box>
  )
}

export default CreateUserPage
