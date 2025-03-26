import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  SelectChangeEvent,
  Switch,
  FormControlLabel
} from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { api } from 'src/configs/api'

interface Product {
  id: string
  fields: {
    Name: string
    description?: string
    price: number
    quantity: number
    category: string
    mesure: string
    Photo?: Array<{
      url: string
      filename: string
    }>
    location?: string
    CreatedDate: string
    LastModifiedDate: string
  }
}

interface ApiResponse {
  id: string
  fields: {
    Name: string
    description?: string
    price: number
    quantity: number
    category: string
    mesure: string
    Photo?: Array<{
      url: string
      filename: string
    }>
    location?: string
    CreatedDate: string
    LastModifiedDate: string
  }
}

interface FormData {
  Name: string
  description: string
  quantity: string
  price: string
  category: string
  mesure: string
  location: string
  photoUrl: string
}

interface UpdateData {
  Name: string
  description: string
  quantity: number
  price: number
  category: string
  mesure: string
  location: string
  Photo?: string[]
}

interface CustomSession {
  user?: {
    id: string
    email: string
    name?: string
  }
  accessToken?: string
}

const EditProduct = () => {
  const router = useRouter()
  const { id } = router.query
  const { data: session } = useSession()
  const customSession = session as CustomSession
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    Name: '',
    description: '',
    quantity: '',
    price: '',
    category: '',
    mesure: '',
    location: '',
    photoUrl: ''
  })
  const [usePhotoUrl, setUsePhotoUrl] = useState(true)

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const token = customSession?.accessToken
      if (!token) {
        setError('Veuillez vous connecter pour modifier le produit.')
        return
      }

      const response = await api.get<ApiResponse>(`/products/${id}`, {
        headers: {
          Authorization: `bearer ${token}`
        }
      })
      const productData = response.data
      setProduct(productData)
      setFormData({
        Name: productData.fields.Name || '',
        description: productData.fields.description || '',
        quantity: productData.fields.quantity?.toString() || '',
        price: productData.fields.price?.toString() || '',
        category: productData.fields.category || '',
        mesure: productData.fields.mesure || '',
        location: productData.fields.location || '',
        photoUrl: productData.fields.Photo?.[0]?.url || ''
      })
    } catch (err) {
      setError('Erreur lors de la récupération du produit')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  const handleSelectChange = (field: string) => (e: SelectChangeEvent) => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = customSession?.accessToken
      if (!token) {
        setError('Veuillez vous connecter pour modifier le produit.')
        return
      }

      const updateData: UpdateData = {
        Name: formData.Name,
        description: formData.description,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        category: formData.category,
        mesure: formData.mesure,
        location: formData.location
      }

      if (usePhotoUrl && formData.photoUrl) {
        updateData.Photo = [formData.photoUrl]
      }

      await api.put(`/products/${id}`, updateData, {
        headers: {
          Authorization: `bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      router.push('/products/myproducts')
    } catch (err) {
      setError('Erreur lors de la mise à jour du produit')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => router.push('/products/myproducts')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Modifier le produit</Typography>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom du produit"
                  value={formData.Name}
                  onChange={handleInputChange('Name')}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prix"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange('price')}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantité"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange('quantity')}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Catégorie</InputLabel>
                  <Select value={formData.category} onChange={handleSelectChange('category')} label="Catégorie">
                    <MenuItem value="Legumes & Fruits">Légumes & Fruits</MenuItem>
                    <MenuItem value="Cereales">Céréales</MenuItem>
                    <MenuItem value="Fruits">Fruits</MenuItem>
                    <MenuItem value="Legumes">Légumes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Mesure</InputLabel>
                  <Select value={formData.mesure} onChange={handleSelectChange('mesure')} label="Mesure">
                    <MenuItem value="Kilo">Kilo</MenuItem>
                    <MenuItem value="Tas">Tas</MenuItem>
                    <MenuItem value="Unite">Unité</MenuItem>
                    <MenuItem value="Litre">Litre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Localisation"
                  value={formData.location}
                  onChange={handleInputChange('location')}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={usePhotoUrl}
                      onChange={(e) => setUsePhotoUrl(e.target.checked)}
                    />
                  }
                  label="Utiliser une URL pour la photo"
                />
              </Grid>

              {usePhotoUrl && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="URL de la photo"
                    value={formData.photoUrl}
                    onChange={handleInputChange('photoUrl')}
                    helperText="Collez l'URL de l'image du produit"
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button variant="outlined" onClick={() => router.push('/products/myproducts')}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                    Enregistrer les modifications
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default EditProduct 