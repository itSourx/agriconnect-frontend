import React, { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { styled } from '@mui/material/styles'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CircularProgress } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import toast from 'react-hot-toast'
import { useNotifications } from '@/hooks/useNotifications'
import { API_BASE_URL } from 'src/configs/constants'

interface Product {
  id: string
  fields: {
    category: string
    [key: string]: any
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
}

interface CustomSession {
  accessToken?: string
  user?: {
    email?: string
  }
}

// Définition de ImgStyled (si non défini ailleurs dans ton projet)
const ImgStyled = styled('img')(({ theme }) => ({
  width: '100%',
  maxWidth: '200px',
  height: 'auto',
  maxHeight: '200px',
  objectFit: 'contain',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[300]}`
}))

const DropZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}))

const AddProductPage = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const customSession = session as CustomSession
  const [formData, setFormData] = useState<FormData>({
    Name: '',
    description: '',
    quantity: '',
    price: '',
    category: '',
    mesure: '',
    location: ''
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const { notifyProductCreated, notifyError } = useNotifications()

  // Mesures disponibles (statiques)
  const mesures = ['Tas', 'Kilo', 'Unite']
  const maxDescriptionLength = 500

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    // Empêcher l'accès aux ADMIN et SUPERADMIN
    if (status === 'authenticated' && session?.user?.profileType) {
      if (session.user.profileType === 'ADMIN' || session.user.profileType === 'SUPERADMIN') {
        toast.error('Vous n\'avez pas les permissions pour ajouter des produits')
        router.push('/products')
        return
      }
    }
  }, [status, session, router])

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(response => response.json())
      .then(data => {
        setProducts(data)
      })
      .catch(err => console.error('Erreur lors de la récupération des produits:', err))
  }, [])

  const categories = [
    'Tubercules',
    'Cereales',
    'Oleagineux',
    'Legumineux',
    'Legumes & Fruits',
    'Fruits',
    'Legumes',
    'Epices'
  ]

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'description' && value.length > maxDescriptionLength) return
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0] || null
    if (file) {
      handleFileChange(file)
    }
  }

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La taille de l'image doit être inférieure à 5 Mo.")
        setPhotoFile(null)
        setImagePreview(null)
        return
      }
      setPhotoFile(file)
      setImagePreview(URL.createObjectURL(file))
      setError(null)
    } else {
      setError('Veuillez sélectionner une image valide (JPG, PNG, GIF).')
      setPhotoFile(null)
      setImagePreview(null)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleFileChange(file)
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Vérifier la limite de 5 photos
    if (galleryFiles.length + files.length > 5) {
      setError('Vous ne pouvez pas ajouter plus de 5 photos à la galerie.')
      return
    }
    
    if (files.some(file => file.size > 5 * 1024 * 1024)) {
      setError('Chaque image de la galerie doit être inférieure à 5 Mo.')
      return
    }
    if (files.some(file => !['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type))) {
      setError("Type d'image invalide dans la galerie. Utilisez JPG, PNG ou GIF.")
      return
    }

    const updatedFiles = [...galleryFiles, ...files]
    setGalleryFiles(updatedFiles)
    setGalleryPreviews(updatedFiles.map(file => URL.createObjectURL(file)))
    setError(null)
    
    // Réinitialiser l'input pour permettre la sélection des mêmes fichiers
    e.target.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = customSession?.accessToken

    if (!token) {
      notifyError('Veuillez vous connecter pour ajouter un produit')
      router.push('/auth/login')
      return
    }

    const user = customSession?.user
    setIsUploading(true)
    setError(null)

    try {
      // Vérifier que tous les champs obligatoires sont remplis
      if (
        !formData.Name ||
        !formData.description ||
        !formData.quantity ||
        !formData.price ||
        !formData.category ||
        !formData.location ||
        !user?.email
      ) {
        throw new Error('Veuillez remplir tous les champs obligatoires')
      }

      // Vérifier qu'au moins une photo est fournie
      if (!photoFile) {
        throw new Error('Veuillez ajouter au moins une photo au produit')
      }

      const formDataToSend = new FormData()
      formDataToSend.append('Name', formData.Name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('quantity', formData.quantity)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('mesure', formData.mesure)
      formDataToSend.append('location', formData.location)
      formDataToSend.append('email', user.email)
      formDataToSend.append('Photo', photoFile)

      // Ajouter les fichiers de la galerie s'il y en a
      //if (galleryFiles.length > 0) {
      //  formDataToSend.append('Gallery', JSON.stringify(galleryFiles.map(file => file.name)))
      //  galleryFiles.forEach(file => {
      //    formDataToSend.append('Gallery', file)
      //  })
      //}

      console.log(formDataToSend)

      const response = await fetch(`${API_BASE_URL}/products/add`, {
        method: 'POST',
        headers: {
          Authorization: `bearer ${token}`
        },
        body: formDataToSend
      })

      if (response.status === 200 || response.status === 201) {
        notifyProductCreated(formData.Name)
        router.push('/products')
      } else if (response.status === 503) {
        throw new Error('Le service est temporairement indisponible. Veuillez réessayer dans quelques minutes.')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de l'ajout du produit")
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err)
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue lors de l'ajout du produit"
      setError(errorMessage)
      notifyError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveGalleryFile = (index: number) => {
    const newFiles = galleryFiles.filter((_, i) => i !== index)
    setGalleryFiles(newFiles)
    setGalleryPreviews(newFiles.map(file => URL.createObjectURL(file)))
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}
          >
            <Box>
              <Typography variant='h5' mb={1} sx={{ fontWeight: 'bold' }}>
                Ajouter un nouveau produit
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant='outlined' color='secondary' onClick={() => router.push('/products')} size="small">
                Annuler
              </Button>
              <Button variant='contained' color='primary' onClick={handleSubmit} disabled={isUploading} size="small">
                {isUploading ? <CircularProgress size={24} /> : 'Publier le produit'}
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={12}>
          <Grid container spacing={6}>
            {/* Informations sur le produit */}
            <Grid item xs={12}>
              <Card sx={{ width: '100%', maxWidth: '100%' }}>
                <CardContent>
                  <Grid container spacing={5}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label='Nom du produit'
                        name='Name'
                        value={formData.Name}
                        onChange={handleTextChange}
                        placeholder='ex. Tomates'
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label='Description'
                        name='description'
                        value={formData.description}
                        onChange={handleTextChange}
                        placeholder='ex. Naturelles sans engrais chimiques'
                        multiline
                        rows={4}
                        inputProps={{ maxLength: maxDescriptionLength }}
                        helperText={`${formData.description.length}/${maxDescriptionLength} caractères`}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label='Quantité'
                        name='quantity'
                        type='number'
                        value={formData.quantity}
                        onChange={handleTextChange}
                        placeholder='ex. 50'
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label='Prix'
                        name='price'
                        value={formData.price}
                        onChange={handleTextChange}
                        placeholder='ex. 750F CFA'
                        type='number'
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel id='category-select'>Catégorie</InputLabel>
                        <Select
                          labelId='category-select'
                          name='category'
                          value={formData.category}
                          onChange={handleSelectChange}
                          label='Catégorie'
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
                      <FormControl fullWidth size="small">
                        <InputLabel id='mesure-select'>Mesure</InputLabel>
                        <Select
                          labelId='mesure-select'
                          name='mesure'
                          value={formData.mesure}
                          onChange={handleSelectChange}
                          label='Mesure'
                        >
                          <MenuItem value=''>Sélectionner</MenuItem>
                          {mesures.map(mes => (
                            <MenuItem key={mes} value={mes}>
                              {mes}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label='Localisation'
                        name='location'
                        value={formData.location}
                        onChange={handleTextChange}
                        placeholder='ex. Cotonou, Bénin'
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Image principale */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title={<Typography variant='subtitle1'>Image principale</Typography>} />
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <DropZone
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      sx={{
                        backgroundColor: isDragging ? 'action.hover' : 'background.default',
                        borderColor: isDragging ? 'primary.main' : 'grey.300'
                      }}
                    >
                      <input type='file' accept='image/*' hidden onChange={handleImageChange} id='image-upload' />
                      <label htmlFor='image-upload'>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                          <Typography variant='body2'>
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
                        <Typography variant='body2' gutterBottom>
                          Aperçu de l'image :
                        </Typography>
                        <ImgStyled src={imagePreview} alt='Photo principale' />
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Galerie */}
            <Grid item xs={12}>
              <Typography variant='subtitle1' gutterBottom>
                Galerie de photos ({galleryFiles.length}/5)
              </Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: galleryFiles.length >= 5 ? 'grey.400' : 'primary.main',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  cursor: galleryFiles.length >= 5 ? 'not-allowed' : 'pointer',
                  opacity: galleryFiles.length >= 5 ? 0.6 : 1,
                  '&:hover': {
                    bgcolor: galleryFiles.length >= 5 ? 'background.paper' : 'action.hover'
                  }
                }}
                onClick={() => {
                  if (galleryFiles.length < 5) {
                    document.getElementById('gallery-upload')?.click()
                  }
                }}
              >
                <input
                  type='file'
                  id='gallery-upload'
                  multiple
                  accept='image/*'
                  style={{ display: 'none' }}
                  onChange={handleGalleryChange}
                  disabled={galleryFiles.length >= 5}
                />
                <CloudUploadIcon sx={{ fontSize: 48, color: galleryFiles.length >= 5 ? 'grey.400' : 'primary.main', mb: 1 }} />
                <Typography variant='body2' color={galleryFiles.length >= 5 ? 'text.disabled' : 'text.secondary'}>
                  {galleryFiles.length >= 5 
                    ? 'Limite de 5 photos atteinte' 
                    : 'Cliquez ou déposez vos images ici pour la galerie'
                  }
                </Typography>
                {galleryFiles.length < 5 && (
                  <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                    Maximum 5 photos autorisées
                  </Typography>
                )}
              </Box>
              {galleryFiles.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {galleryFiles.map((file, index) => (
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
                        src={URL.createObjectURL(file)}
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
                        onClick={() => handleRemoveGalleryFile(index)}
                      >
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Typography variant='body2' color='error'>{error}</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default AddProductPage
