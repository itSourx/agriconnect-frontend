import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { styled } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Définition de ImgStyled (si non défini ailleurs dans ton projet)
const ImgStyled = styled('img')(({ theme }) => ({
  width: '100%',
  maxWidth: '200px',
  height: 'auto',
  maxHeight: '200px',
  objectFit: 'contain',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[300]}`,
}));

const AddProductPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    Name: '',
    description: '',
    quantity: '',
    price: '',
    category: '',
    mesure: '',
    photoUrl: '',
  });
  const [photoFile, setPhotoFile] = useState(null); // Image principale
  const [galleryFiles, setGalleryFiles] = useState([]); // Images de la galerie
  const [imagePreview, setImagePreview] = useState(null); // Prévisualisation image principale
  const [galleryPreviews, setGalleryPreviews] = useState([]); // Prévisualisation galerie
  const [usePhotoUrl, setUsePhotoUrl] = useState(false); // Bascule lien/upload
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  // Mesures disponibles (statiques)
  const mesures = ['Tas', 'Kg', 'Unité', 'Litre'];
  const maxDescriptionLength = 500; // Limite de caractères pour la description

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetch('https://agriconnect-bc17856a61b8.herokuapp.com/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Erreur lors de la récupération des produits:', err));
  }, []);

  // Extraire les catégories uniques
  const categories = [...new Set(products.map(p => p.fields.category).filter(Boolean))];

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'description' && value.length > maxDescriptionLength) return; // Limite description
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La taille de l’image doit être inférieure à 5 Mo.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('Type d’image invalide. Utilisez JPG, PNG ou GIF.');
      return;
    }

    setPhotoFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleGalleryChange = e => {
    const files = Array.from(e.target.files);
    if (files.some(file => file.size > 5 * 1024 * 1024)) {
      setError('Chaque image de la galerie doit être inférieure à 5 Mo.');
      return;
    }
    if (files.some(file => !['image/jpeg', 'image/png', 'image/gif'].includes(file.type))) {
      setError('Type d’image invalide dans la galerie. Utilisez JPG, PNG ou GIF.');
      return;
    }

    setGalleryFiles(files);
    setGalleryPreviews(files.map(file => URL.createObjectURL(file)));
    setError(null);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    const token = session?.accessToken;
  
    if (!token) {
      setError('Veuillez vous connecter pour ajouter un produit.');
      router.push('/auth/login');
      return;
    }
  
    const user = session?.user;
    const productData = {
      Name: formData.Name,
      description: formData.description,
      quantity: Number(formData.quantity),
      price: Number(formData.price), 
      category: formData.category,
      email: user?.email || '',
      Photo: [], 
    };
  
    // Gestion des photos
    if (usePhotoUrl && formData.photoUrl) {
      productData.Photo = [formData.photoUrl]; // Ajout de l'URL si fourni
    } else if (photoFile) {
      setError('L’upload de fichiers n’est pas encore implémenté. Utilisez un lien URL.');
      return;
    }
  
    if (galleryFiles.length > 0) {
      // Pour la galerie, simuler des URLs (à remplacer par un vrai upload)
      setError('L’upload de fichiers pour la galerie n’est pas encore implémenté. Utilisez un lien URL pour l’image principale.');
      return;
    }
  
    console.log(JSON.stringify(productData, null, 2));
    try {
      const response = await fetch('https://agriconnect-bc17856a61b8.herokuapp.com/products/add', {
        method: 'POST',
        headers: {
          Authorization: `bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
  
      if (response.status === 200 || response.status === 201) {
        router.push('/products');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l’ajout du produit');
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError(err.message || 'Une erreur est survenue lors de l’ajout du produit');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}
          >
            <Box>
              <Typography variant='h4' mb={1}>
                Ajouter un nouveau produit
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant='outlined' color='secondary' onClick={() => router.push('/products')}>
                Annuler
              </Button>
              <Button variant='contained' color='primary' onClick={handleSubmit}>
                Publier le produit
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={6}>
            {/* Informations sur le produit */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Grid container spacing={5}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label='Nom du produit'
                        name='Name'
                        value={formData.Name}
                        onChange={handleChange}
                        placeholder='ex. Tomates'
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label='Description'
                        name='description'
                        value={formData.description}
                        onChange={handleChange}
                        placeholder='ex. Naturelles sans engrais chimiques'
                        multiline
                        rows={4}
                        inputProps={{ maxLength: maxDescriptionLength }}
                        helperText={`${formData.description.length}/${maxDescriptionLength} caractères`}
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
                        placeholder='ex. 50'
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label='Prix'
                        name='price'
                        value={formData.price}
                        onChange={handleChange}
                        placeholder='ex. 750F CFA'
                        type='number'
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
                      <FormControl fullWidth>
                        <InputLabel id='mesure-select'>Mesure</InputLabel>
                        <Select
                          labelId='mesure-select'
                          name='mesure'
                          value={formData.mesure}
                          onChange={handleChange}
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
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Image principale */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title={<Typography variant='h5'>Image principale</Typography>} />
                <CardContent>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={usePhotoUrl}
                        onChange={e => setUsePhotoUrl(e.target.checked)}
                      />
                    }
                    label='Utiliser un lien URL au lieu d’un upload'
                  />
                  {usePhotoUrl ? (
                    <TextField
                      fullWidth
                      label="URL de l'image"
                      name='photoUrl'
                      value={formData.photoUrl}
                      onChange={handleChange}
                      placeholder='ex. https://example.com/tomates.jpg'
                      helperText="Collez l'URL de l'image principale"
                    />
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button variant='outlined' component='label'>
                        Uploader une image
                        <input
                          type='file'
                          accept='image/*'
                          hidden
                          onChange={handleImageChange}
                        />
                      </Button>
                      {imagePreview && (
                        <ImgStyled src={imagePreview} alt='Photo principale' />
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Galerie */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title={<Typography variant='h5'>Galerie de photos</Typography>} />
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button variant='outlined' component='label'>
                      Uploader des images
                      <input
                        type='file'
                        accept='image/*'
                        multiple
                        hidden
                        onChange={handleGalleryChange}
                      />
                    </Button>
                    {galleryPreviews.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {galleryPreviews.map((src, index) => (
                          <ImgStyled key={index} src={src} alt={`Photo galerie ${index + 1}`} />
                        ))}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Typography color='error'>{error}</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AddProductPage;