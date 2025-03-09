// pages/users/edit/[id].tsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import api from 'src/api/axiosConfig';

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  margin: '0 auto',
  marginTop: theme.spacing(4),
}));

interface User {
  id: string;
  fields: {
    email: string;
    Status?: string;
    FirstName?: string;
    LastName?: string;
    profileType: string[];
    Phone?: string;
    Address?: string;
    ifu?: number;
    raisonSociale?: string;
  };
}

const EditUserPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query; // Récupère l'ID de l'utilisateur depuis l'URL
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données de l'utilisateur
  useEffect(() => {
    if (status === 'loading' || !id) return;
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    const fetchUser = async () => {
      const token = session?.accessToken;
      if (!token) {
        setError('Veuillez vous connecter pour modifier un utilisateur.');
        router.push('/auth/login');
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`https://agriconnect-bc17856a61b8.herokuapp.com/users/${id}`, {
          headers: {
            Accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
      } catch (err) {
        setError('Erreur lors de la récupération des données de l’utilisateur');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, router, session, status]);

  // Gérer les changements dans les champs
  const handleChange = (field: keyof User['fields']) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (userData) {
      setUserData({
        ...userData,
        fields: {
          ...userData.fields,
          [field]: event.target.value,
        },
      });
    }
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    const token = session?.accessToken;
    if (!token || !userData) {
      setError('Veuillez vous connecter pour sauvegarder les modifications.');
      return;
    }

    try {
      const updateData = {
        fields: {
          FirstName: userData.fields.FirstName,
          LastName: userData.fields.LastName,
          email: userData.fields.email,
          Phone: userData.fields.Phone,
          Address: userData.fields.Address,
          raisonSociale: userData.fields.raisonSociale,
          // Ne pas modifier profileType ou Status ici (géré séparément si besoin)
        },
      };

      const response = await api.put(
        `https://agriconnect-bc17856a61b8.herokuapp.com/users/${id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        router.push('/users/manage'); // Retour à la liste après succès
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour de l’utilisateur');
    }
  };

  if (loading) {
    return <Box sx={{ p: 4 }}>Chargement...</Box>;
  }

  if (error || !userData) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error || 'Utilisateur non trouvé'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <StyledCard>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Modifier l’utilisateur
          </Typography>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom"
                value={userData.fields.FirstName || ''}
                onChange={handleChange('FirstName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                value={userData.fields.LastName || ''}
                onChange={handleChange('LastName')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={userData.fields.email}
                onChange={handleChange('email')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={userData.fields.Phone || ''}
                onChange={handleChange('Phone')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Adresse"
                value={userData.fields.Address || ''}
                onChange={handleChange('Address')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Raison Sociale"
                value={userData.fields.raisonSociale || ''}
                onChange={handleChange('raisonSociale')}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => router.push('/users/manage')}>
              Annuler
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Sauvegarder
            </Button>
          </Box>
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default EditUserPage;