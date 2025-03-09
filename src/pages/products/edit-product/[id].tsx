import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import Avatar from '@mui/material/Avatar'
import { useSession } from 'next-auth/react'

const EditProduct = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { id } = router.query
  const [product, setProduct] = useState(null)
  const [formData, setFormData] = useState({
    Name: '',
    description: '',
    quantity: '',
    price: '',
    category: '',
    mesure: '',
    photoUrl: '',
    farmerId: '',
    location: ''
  })
  const [farmers, setFarmers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === 'loading') return; // Attend que la session soit chargée
    if (status === 'unauthenticated') {
      router.push('/auth/login'); 
    }
  }, [status, router]);

  // Charger les données du produit
  useEffect(() => {
    if (id) {
      fetch(`https://agriconnect-bc17856a61b8.herokuapp.com/products/${id}`)
        .then(response => {
          if (!response.ok) throw new Error('Produit non trouvé')
          return response.json()
        })
        .then(data => {
          setProduct(data)
          setFormData({
            Name: data.fields.Name || '',
            description: data.fields.description || '',
            quantity: data.fields.quantity || '',
            price: data.fields.price || '',
            category: data.fields.category || '',
            mesure: data.fields.mesure || '',
            photoUrl: data.fields.Photo?.[0]?.url || '',
            farmerId: data.fields.farmerId?.[0] || '', // Pré-sélectionner l'agriculteur actuel
            location: data.fields.location || ''
          })
          setLoading(false)
        })
        .catch(err => {
          console.error('Erreur lors du chargement du produit:', err)
          setError(err.message)
          setLoading(false)
        })
    }
  }, [id])

  // Charger toutes les catégories disponibles
  useEffect(() => {
    fetch('https://agriconnect-bc17856a61b8.herokuapp.com/products')
      .then(response => response.json())
      .then(data => {
        const uniqueCategories = [...new Set(data.map(p => p.fields.category).filter(Boolean))]
        setCategories(uniqueCategories)
      })
      .catch(err => console.error('Erreur lors de la récupération des catégories:', err))
  }, [])

  // Charger tous les agriculteurs disponibles
  useEffect(() => {
    fetch('https://agriconnect-bc17856a61b8.herokuapp.com/users/by-profile/AGRICULTEUR', {
      headers: { accept: '*/*' }
    })
      .then(response => response.json())
      .then(data => setFarmers(data))
      .catch(err => console.error('Erreur lors de la récupération des agriculteurs:', err))
  }, [])

  // Options pour mesure (statiques)
  const mesures = ['Tas', 'Kg', 'Unité', 'Litre']

  // Gérer les changements dans les champs
  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Soumettre les modifications
  const handleSubmit = e => {
    e.preventDefault()
    const token = session?.accessToken;
    if (!token) {
      setError('Veuillez vous connecter pour modifier un produit.')
      router.push('/auth/login');
      return
    }

    const updatedFields = {
      Name: formData.Name,
      description: formData.description,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      category: formData.category,
      mesure: formData.mesure,
      Photo: formData.photoUrl ? [formData.photoUrl] : [],
      // email: farmers.find(f => f.id === formData.farmerId)?.fields.email || '',
      location: formData.location
    }

    console.log(updatedFields)

    fetch(`https://agriconnect-bc17856a61b8.herokuapp.com/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token}`
      },
      body: JSON.stringify(updatedFields)
    })
      .then(response => {
        if (response.ok) {
          router.push('/products')
        } else {
          return response.json().then(err => {
            throw new Error(err.message || 'Erreur lors de la mise à jour')
          })
        }
      })
      .catch(err => {
        console.error('Erreur lors de la soumission:', err)
        setError(err.message)
      })
  }

  if (status === 'loading' || loading) return <Typography>Chargement...</Typography>;
  if (error) return <Typography color='error'>{error}</Typography>

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={`Éditer le produit : ${formData.Name}`} />
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Nom'
                      name='Name'
                      value={formData.Name}
                      onChange={handleChange}
                      variant='outlined'
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Description'
                      name='description'
                      value={formData.description}
                      onChange={handleChange}
                      variant='outlined'
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Quantité'
                      name='quantity'
                      type='number'
                      value={formData.quantity}
                      onChange={handleChange}
                      variant='outlined'
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Prix'
                      name='price'
                      value={formData.price}
                      onChange={handleChange}
                      variant='outlined'
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id='category-select'>Catégorie</InputLabel>
                      <Select
                        labelId='category-select'
                        name='category'
                        value={formData.category}
                        onChange={handleChange}
                        input={<OutlinedInput label='Catégorie' />}
                      >
                        <MenuItem value=''>Sélectionner</MenuItem>
                        {categories.map(cat => (
                          <MenuItem key={cat} value={cat}>
                            {cat}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id='mesure-select'>Mesure</InputLabel>
                      <Select
                        labelId='mesure-select'
                        name='mesure'
                        value={formData.mesure}
                        onChange={handleChange}
                        input={<OutlinedInput label='Mesure' />}
                      >
                        <MenuItem value=''>Aucune</MenuItem>
                        {mesures.map(mes => (
                          <MenuItem key={mes} value={mes}>
                            {mes}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant='body1'>Photo</Typography>
                      {formData.photoUrl ? (
                        <Avatar src={formData.photoUrl} alt='Photo du produit' sx={{ width: 100, height: 100 }} />
                      ) : (
                        <Typography>Aucune photo</Typography>
                      )}
                      <TextField
                        fullWidth
                        label='URL de la nouvelle photo'
                        name='photoUrl'
                        value={formData.photoUrl}
                        onChange={handleChange}
                        variant='outlined'
                        helperText='Entrez une nouvelle URL pour remplacer la photo'
                      />
                    </Box>
                  </Grid>
                  {/* Sélection de l'agriculteur */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id='farmer-select'>Agriculteur</InputLabel>
                      <Select
                        labelId='farmer-select'
                        name='farmerId'
                        value={formData.farmerId}
                        onChange={handleChange}
                        input={<OutlinedInput label='Agriculteur' />}
                      >
                        <MenuItem value=''>Sélectionner</MenuItem>
                        {farmers.map(farmer => (
                          <MenuItem key={farmer.id} value={farmer.id}>
                            {`${farmer.fields.FirstName} ${farmer.fields.LastName}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {/* Localisation */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Localisation'
                      name='location'
                      value={formData.location}
                      onChange={handleChange}
                      variant='outlined'
                      helperText='Modifiez la localisation si nécessaire'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        type='submit'
                        variant='contained'
                        color='primary'
                        startIcon={<i className='ri-save-line'></i>}
                      >
                        Sauvegarder
                      </Button>
                      <Button
                        variant='outlined'
                        color='secondary'
                        onClick={() => router.push('/products')}
                        startIcon={<i className='ri-arrow-left-line'></i>}
                      >
                        Annuler
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default EditProduct
