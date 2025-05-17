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
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CardMedia from '@mui/material/CardMedia';
import { styled } from '@mui/material/styles';
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast';
import { useNotifications } from '@/hooks/useNotifications'

const ImgStyled = styled('img')(({ theme }) => ({
  width: '100%',
  maxWidth: '200px',
  height: 'auto',
  maxHeight: '200px',
  objectFit: 'contain',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[300]}`,
}));

const DropZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));


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
    farmerId: '',
    location: ''
  })
  const [initialFormData, setInitialFormData] = useState(null)
  const [farmers, setFarmers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const { notifyProductUpdated, notifyError } = useNotifications()

  useEffect(() => {
    if (status === 'loading') return; // Attend que la session soit chargée
    if (status === 'unauthenticated') {
      router.push('/auth/login'); 
    }
  }, [status, router]);

  // Charger les données du produit
  useEffect(() => {
    if (id) {
      fetch(`https://agriconnect-bc17856a61b8.herokuapp.com/products/${id}`, {
        headers: {
          'accept': '*/*',
          'Authorization': `bearer ${session?.accessToken}`
        }
      })
        .then(response => {
          if (!response.ok) throw new Error('Produit non trouvé')
          return response.json()
        })
        .then(data => {
          setProduct(data)
          const initialData = {
            Name: data.fields.Name || '',
            description: data.fields.description || '',
            quantity: data.fields.quantity || '',
            price: data.fields.price || '',
            category: data.fields.category || '',
            mesure: data.fields.mesure || '',
            farmerId: data.fields.farmerId?.[0] || '',
            location: data.fields.location || ''
          }
          setFormData(initialData)
          setInitialFormData(initialData)
          setImagePreview(data.fields.Photo?.[0]?.url || null)
          setLoading(false)
        })
        .catch(err => {
          console.error('Erreur lors du chargement du produit:', err)
          setError(err.message)
          setLoading(false)
        })
    }
  }, [id, session?.accessToken])

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
    if (!session?.accessToken) return
    fetch('https://agriconnect-bc17856a61b8.herokuapp.com/users/by-profile/AGRICULTEUR', {
      headers: {
        accept: '*/*',
        Authorization: `bearer ${session.accessToken}` 
      }
    })
      .then(response => response.json())
      .then(data => setFarmers(data))
      .catch(err => console.error('Erreur lors de la récupération des agriculteurs:', err))
    }, [session?.accessToken])

  // Options pour mesure (statiques)
  const mesures = ['Tas', 'Kilo', 'Unite']

  // Gérer les changements dans les champs
  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Gérer la sélection du fichier
  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setImagePreview(URL.createObjectURL(file)) 
    } else {
      setError('Veuillez sélectionner une image valide')
      setSelectedFile(null)
      setImagePreview(null)
    }
  }

  const handleDragOver = e => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = e => {
    e.preventDefault()
    setIsDragging(false)
  }
  
  const handleDrop = e => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    console.log(file);
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setImagePreview(URL.createObjectURL(file))
    } else {
      setError('Veuillez sélectionner une image valide')
      setSelectedFile(null)
      setImagePreview(null)
    }
  }

  // Soumettre les modifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = session?.accessToken
      if (!token) {
        notifyError('Veuillez vous connecter pour modifier un produit')
        router.push('/auth/login')
        return
      }

      // Créer un objet avec uniquement les champs modifiés
      const changedFields = {}
      Object.keys(formData).forEach(key => {
        if (formData[key] !== initialFormData[key]) {
          changedFields[key] = formData[key]
        }
      })

      // Si une nouvelle image est sélectionnée, l'ajouter
      if (selectedFile) {
        changedFields.Photo = selectedFile
      }

      // Si aucun champ n'a été modifié, ne pas envoyer la requête
      if (Object.keys(changedFields).length === 0 && !selectedFile) {
        notifyError('Aucune modification détectée')
        return
      }

      const formData2 = new FormData()
      Object.entries(changedFields).forEach(([key, value]) => {
        formData2.append(key, value)
      })

      const response = await fetch(`https://agriconnect-bc17856a61b8.herokuapp.com/products/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `bearer ${token}`,
        },
        body: formData2
      })

      if (response.ok) {
        notifyProductUpdated(formData.Name)
        router.push('/products/myproducts')
      } else {
        notifyError('Erreur lors de la modification du produit')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      notifyError('Erreur lors de la modification du produit')
    }
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
                      
                      <DropZone
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        sx={{
                          backgroundColor: isDragging ? 'action.hover' : 'background.default',
                          borderColor: isDragging ? 'primary.main' : 'grey.300'
                        }}
                      >
                        <input
                          type='file'
                          accept='image/*'
                          hidden
                          onChange={handleFileChange}
                          id='image-upload'
                        />
                        <label htmlFor='image-upload'>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                            <Typography variant='body1'>
                              Glissez-déposez une image ici ou cliquez pour sélectionner
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              JPG, PNG ou GIF (max 5 Mo)
                            </Typography>
                          </Box>
                        </label>
                      </DropZone>
                      {imagePreview && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant='subtitle2' gutterBottom>
                            Aperçu de l'image :
                          </Typography>
                          <ImgStyled src={imagePreview} alt='Photo principale' />
                        </Box>
                      )}
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
                        disabled={session?.user?.profileType === 'AGRICULTEUR'}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: session?.user?.profileType === 'AGRICULTEUR' ? 'grey.300' : undefined
                          },
                          '& .MuiSelect-icon': {
                            color: session?.user?.profileType === 'AGRICULTEUR' ? 'grey.400' : undefined
                          }
                        }}
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
                        onClick={() => router.push('/products/myproducts')}
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
