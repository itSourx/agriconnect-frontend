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
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'

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
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [existingGallery, setExistingGallery] = useState<string[]>([])

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
          // Charger les images de la galerie existante
          setExistingGallery(data.fields.Gallery?.map((img: any) => img.url) || [])
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

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.some(file => file.size > 5 * 1024 * 1024)) {
      setError('Chaque image de la galerie doit être inférieure à 5 Mo.')
      return
    }
    if (files.some(file => !['image/jpeg', 'image/png', 'image/gif'].includes(file.type))) {
      setError("Type d'image invalide dans la galerie. Utilisez JPG, PNG ou GIF.")
      return
    }

    setGalleryFiles(files)
    setGalleryPreviews(files.map(file => URL.createObjectURL(file)))
    setError(null)
  }

  const handleRemoveGalleryFile = (index: number) => {
    const newFiles = galleryFiles.filter((_, i) => i !== index)
    setGalleryFiles(newFiles)
    setGalleryPreviews(newFiles.map(file => URL.createObjectURL(file)))
  }

  const handleRemoveExistingImage = (index: number) => {
    const newGallery = existingGallery.filter((_, i) => i !== index)
    setExistingGallery(newGallery)
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

      const changedFields = {}
      Object.keys(formData).forEach(key => {
        if (formData[key] !== initialFormData[key]) {
          changedFields[key] = formData[key]
        }
      })

      // N'ajouter la photo que si elle a été modifiée
      if (selectedFile) {
        changedFields.Photo = selectedFile
      }

      // N'ajouter la galerie que si elle a été modifiée
      if (galleryFiles.length > 0) {
        changedFields.Gallery = galleryFiles
      }

      // N'ajouter la galerie existante que si elle a été modifiée
      if (JSON.stringify(existingGallery) !== JSON.stringify(product?.fields?.Gallery?.map((img: any) => img.url) || [])) {
        changedFields.existingGallery = existingGallery
      }

      if (Object.keys(changedFields).length === 0) {
        notifyError('Aucune modification détectée')
        return
      }

      const formData2 = new FormData()
      Object.entries(changedFields).forEach(([key, value]) => {
        if (key === 'Gallery' && Array.isArray(value)) {
          value.forEach(file => formData2.append('Gallery', file))
        } else if (key === 'existingGallery' && Array.isArray(value)) {
          formData2.append('existingGallery', JSON.stringify(value))
        } else {
          formData2.append(key, value)
        }
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
        if (session?.user?.profileType === 'ADMIN') {
          router.push('/products')
        } else {
          router.push('/products/myproducts')
        }
      } else {
        const errorData = await response.json()
        notifyError(errorData.message || 'Erreur lors de la modification du produit')
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
                  {/* Galerie existante */}
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' gutterBottom>
                      Galerie actuelle
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                      {existingGallery.map((url, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: 'relative',
                            width: 100,
                            height: 100,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <img
                            src={url}
                            alt={`Galerie ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <IconButton
                            size='small'
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'background.paper',
                              '&:hover': {
                                bgcolor: 'error.light',
                                color: 'error.main'
                              }
                            }}
                            onClick={() => handleRemoveExistingImage(index)}
                          >
                            <DeleteIcon fontSize='small' />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                  {/* Ajout de nouvelles images à la galerie */}
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' gutterBottom>
                      Ajouter des images à la galerie
                    </Typography>
                    <Box
                      sx={{
                        border: '2px dashed',
                        borderColor: 'primary.main',
                        borderRadius: 1,
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                      onClick={() => document.getElementById('gallery-upload')?.click()}
                    >
                      <input
                        type='file'
                        id='gallery-upload'
                        multiple
                        accept='image/*'
                        style={{ display: 'none' }}
                        onChange={handleGalleryChange}
                      />
                      <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant='body2' color='text.secondary'>
                        Cliquez ou déposez vos images ici pour la galerie
                      </Typography>
                    </Box>
                    {galleryPreviews.length > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {galleryPreviews.map((preview, index) => (
                          <Box
                            key={index}
                            sx={{
                              position: 'relative',
                              width: 100,
                              height: 100,
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            <img
                              src={preview}
                              alt={`Nouvelle image ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            <IconButton
                              size='small'
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'background.paper',
                                '&:hover': {
                                  bgcolor: 'error.light',
                                  color: 'error.main'
                                }
                              }}
                              onClick={() => handleRemoveGalleryFile(index)}
                            >
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
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
