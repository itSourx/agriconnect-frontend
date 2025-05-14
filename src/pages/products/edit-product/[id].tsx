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
    photoUrl: '',
    farmerId: '',
    location: ''
  })
  const [farmers, setFarmers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useUpload, setUseUpload] = useState(false) 
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

  // Gérer le changement du switch
  const handleSwitchChange = e => {
    setUseUpload(e.target.checked)
    setSelectedFile(null)
    setFormData(prev => ({ ...prev, photoUrl: product?.fields.Photo?.[0]?.url || '' })) 
    setImagePreview(null)
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
      console.log(selectedFile);
      const updatedFields = {
        Name: formData.Name,
        description: formData.description,
        quantity: formData.quantity.toString(),
        price: formData.price.toString(),
        category: formData.category,
        mesure: formData.mesure,
        // Photo: useUpload && selectedFile ? selectedFile : formData.photoUrl ? [formData.photoUrl] : [],
        Photo: selectedFile,
        farmerId: [formData.farmerId],
        location: formData.location
      }
      const formData2 = new FormData();
      //formData2.append('Name', updatedFields.Name);
      //formData2.append('description', updatedFields.description);
      //formData2.append('quantity', updatedFields.quantity);
      formData2.append('price', updatedFields.price);
      //formData2.append('category', updatedFields.category);
      // formData2.append('mesure', updatedFields.mesure);
      // formData2.append('Photo', selectedFile);
      //formData2.append('farmerId', updatedFields.farmerId);
      //formData2.append('location', updatedFields.location);
      console.log(formData2);

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
                      <FormControlLabel
                        control={<Switch checked={useUpload} onChange={handleSwitchChange} />}
                        label={useUpload ? 'Uploader une image' : 'Utiliser une URL'}
                      />
                      {formData.photoUrl && !useUpload ? (
                        <CardMedia
                        component="img"
                        image={imagePreview || formData.photoUrl}
                        alt="Photo du produit"
                        sx={{
                          width: '100%',
                          maxWidth: '200px',
                          height: 'auto',
                          maxHeight: '200px',
                          objectFit: 'contain',
                          borderRadius: '2px',
                          border: (theme) => `1px solid ${theme.palette.grey[300]}`,
                          mt: 2 
                        }}
                      />
                      
                      ) : (
                        <Typography>Aucune photo</Typography>
                      )}
                      {useUpload ? (
                        <Box>
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
                      ) : (
                        <TextField
                          fullWidth
                          label='URL de la nouvelle photo'
                          name='photoUrl'
                          value={formData.photoUrl}
                          onChange={handleChange}
                          variant='outlined'
                          helperText='Entrez une nouvelle URL pour remplacer la photo'
                        />
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
