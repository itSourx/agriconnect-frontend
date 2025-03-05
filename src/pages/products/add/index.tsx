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
import { useRouter } from 'next/navigation';

const AddProductPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    Name: '',
    description: '',
    quantity: '',
    price: '',
    category: '',
    mesure: '',
    photoUrl: '',
    email: '',
    location: '',
  });
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]); // État pour stocker les agriculteurs
  const [error, setError] = useState(null);

  // Mesures disponibles (statiques)
  const mesures = ['Tas', 'Kg', 'Unité', 'Litre'];

  // Charger les produits (pour les catégories) et les agriculteurs
  useEffect(() => {
    // Récupérer les produits pour les catégories
    fetch('https://agriconnect-bc17856a61b8.herokuapp.com/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Erreur lors de la récupération des produits:', err));

    // Récupérer les agriculteurs
    fetch('https://agriconnect-bc17856a61b8.herokuapp.com/users/by-profile/AGRICULTEUR', {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
    })
      .then(response => response.json())
      .then(data => setFarmers(data))
      .catch(err => console.error('Erreur lors de la récupération des agriculteurs:', err));
  }, []);

  // Extraire les catégories uniques
  const categories = [...new Set(products.map(p => p.fields.category).filter(Boolean))];

  // Gérer les changements dans les champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Soumettre le formulaire avec le token d’authentification
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Veuillez vous connecter pour ajouter un produit.');
      return;
    }

    const productData = {
      Name: formData.Name,
      description: formData.description,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      category: formData.category,
      email: formData.email,
      Photo: formData.photoUrl ? [formData.photoUrl] : [],
    };

    console.log(productData);

    fetch('https://agriconnect-bc17856a61b8.herokuapp.com/products/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify(productData),
    })
      .then(response => {
        if (response.ok) {
          router.push('/products');
        } else {
          return response.json().then(err => {
            throw new Error(err.message || 'Erreur lors de l’ajout du produit');
          });
        }
      })
      .catch(err => {
        console.error('Erreur lors de la soumission:', err);
        setError(err.message);
      });
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            <Box>
              <Typography variant="h4" mb={1}>Ajouter un nouveau produit</Typography>
              <Typography variant="body1">Créer un produit pour AgriConnect</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" color="secondary" onClick={() => router.push('/products')}>
                Annuler
              </Button>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
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
                <CardHeader title={<Typography variant="h5">Informations sur le produit</Typography>} />
                <CardContent>
                  <Grid container spacing={5}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nom du produit"
                        name="Name"
                        value={formData.Name}
                        onChange={handleChange}
                        placeholder="ex. Tomates"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="ex. Naturelles sans engrais chimiques"
                        multiline
                        rows={4}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Quantité"
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="ex. 50"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Prix"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="ex. 750F CFA"
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="category-select">Catégorie</InputLabel>
                        <Select
                          labelId="category-select"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          label="Catégorie"
                        >
                          <MenuItem value="">Sélectionner</MenuItem>
                          {categories.map(cat => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="mesure-select">Mesure</InputLabel>
                        <Select
                          labelId="mesure-select"
                          name="mesure"
                          value={formData.mesure}
                          onChange={handleChange}
                          label="Mesure"
                        >
                          <MenuItem value="">Sélectionner</MenuItem>
                          {mesures.map(mes => (
                            <MenuItem key={mes} value={mes}>{mes}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Image du produit */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title={<Typography variant="h5">Image du produit</Typography>} />
                <CardContent>
                  <TextField
                    fullWidth
                    label="URL de l'image"
                    name="photoUrl"
                    value={formData.photoUrl}
                    onChange={handleChange}
                    placeholder="ex. https://example.com/tomates.jpg"
                    helperText="Collez l'URL de l'image du produit"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={6}>
            {/* Organiser */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title={<Typography variant="h5">Organiser</Typography>} />
                <CardContent>
                  <form style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <FormControl fullWidth>
                      <InputLabel id="email-select">Email de l’agriculteur</InputLabel>
                      <Select
                        labelId="email-select"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        label="Email de l’agriculteur"
                      >
                        <MenuItem value="">Sélectionner</MenuItem>
                        {farmers.map(farmer => (
                          <MenuItem key={farmer.id} value={farmer.fields.email}>
                            {`${farmer.fields.FirstName} ${farmer.fields.LastName} (${farmer.fields.email})`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Localisation"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="ex. Natitingou"
                    />
                  </form>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Typography color="error">{error}</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AddProductPage;