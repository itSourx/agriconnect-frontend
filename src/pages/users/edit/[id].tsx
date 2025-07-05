import { withAuth } from '@/components/auth/withAuth';
import { useState, useEffect, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button, { ButtonProps } from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { styled } from '@mui/material/styles';
import api from 'src/api/axiosConfig';
import { toast } from 'react-hot-toast';
import { useNotifications } from '@/hooks/useNotifications';
import CircularProgress from '@mui/material/CircularProgress';
import { API_BASE_URL } from 'src/configs/constants';

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius,
}));

const ButtonStyled = styled(Button)<ButtonProps & { component?: any; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center',
  },
}));

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4),
  },
}));

interface ApiResponse {
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
    Photo?: { url: string }[];
    ProductsName?: string[];
  };
}

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
    Photo?: { url: string }[];
    ProductsName?: string[];
  };
}

const EditUserPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [userData, setUserData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof User['fields'], string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png');
  const [isIndividual, setIsIndividual] = useState<boolean>(true); // Par défaut, particulier
  const { notifySuccess, notifyError } = useNotifications();

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
        setIsLoading(true);
        const response = await api.get<ApiResponse>(`/users/${id}`, {
          headers: {
            Accept: '*/*',
            Authorization: `bearer ${token}`,
          },
        });
        const userFields = response.data.fields;
        console.log(userFields);
        const photoUrl = userFields.Photo?.[0]?.url || '/images/avatars/1.png';
        const fetchedUser: User = {
          id: response.data.id,
          fields: {
            email: userFields.email || '',
            Status: userFields.Status || '',
            FirstName: userFields.FirstName || '',
            LastName: userFields.LastName || '',
            profileType: userFields.profileType || [],
            Phone: userFields.Phone || '',
            Address: userFields.Address || '',
            ifu: userFields.ifu || 0,
            raisonSociale: userFields.raisonSociale || '',
            Photo: userFields.Photo || [],
            ProductsName: userFields.ProductsName || [],
          },
        };
        setUserData(fetchedUser);
        setImgSrc(photoUrl);
        setIsIndividual(!userFields.raisonSociale);
      } catch (err) {
        setError("Erreur lors de la récupération des données de l'utilisateur");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, router, session, status]);

  const validateField = (field: keyof User['fields'], value: string | { url: string }[]) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) newErrors[field] = "L'email est requis";
        else if (!emailRegex.test(value as string)) newErrors[field] = "Format d'email invalide";
        else delete newErrors[field];
        break;
      case 'FirstName':
        if (isIndividual) {
          if (!value) newErrors[field] = 'Le prénom est requis';
          else if ((value as string).length > 50) newErrors[field] = 'Le prénom ne doit pas dépasser 50 caractères';
          else delete newErrors[field];
        }
        break;
      case 'LastName':
        if (isIndividual) {
          if (!value) newErrors[field] = 'Le nom est requis';
          else if ((value as string).length > 50) newErrors[field] = 'Le nom ne doit pas dépasser 50 caractères';
          else delete newErrors[field];
        }
        break;
      case 'Phone':
        const phoneRegex = /^\+229\d{8}$/;
        if (value && !phoneRegex.test(value as string))
          newErrors[field] = 'Numéro invalide (ex. +22952805408)';
        else delete newErrors[field];
        break;
      case 'Address':
        if (value && (value as string).length > 100)
          newErrors[field] = "L'adresse ne doit pas dépasser 100 caractères";
        else delete newErrors[field];
        break;
      case 'raisonSociale':
        if (!isIndividual) {
          if (!value) newErrors[field] = 'La raison sociale est requise';
          else if ((value as string).length > 100)
            newErrors[field] = 'La raison sociale ne doit pas dépasser 100 caractères';
          else delete newErrors[field];
        }
        break;
      case 'Photo':
        if (value && Array.isArray(value) && value.length > 0 && typeof value[0].url !== 'string') {
          const file = value[0].url as any as File;
          if (file.size > 800 * 1024) newErrors[field] = 'La photo ne doit pas dépasser 800 Ko';
          else delete newErrors[field];
        } else delete newErrors[field];
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof User['fields']) => (event: ChangeEvent<HTMLInputElement>) => {
    if (userData) {
      const value = event.target.value;
      setUserData({
        ...userData,
        fields: {
          ...userData.fields,
          [field]: value,
        },
      });
      validateField(field, value);
    }
  };

  const handlePhotoChange = (file: ChangeEvent) => {
    const reader = new FileReader();
    const { files } = file.target as HTMLInputElement;
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string);
      reader.readAsDataURL(files[0]);
      const newPhoto = [{ url: files[0] as any }]; // Stocke temporairement comme fichier
      setUserData({
        ...userData!,
        fields: {
          ...userData!.fields,
          Photo: newPhoto,
        },
      });
      validateField('Photo', newPhoto);
    }
  };

  const handleSave = async () => {
    if (!userData) return;

    try {
      setSaving(true);
    const token = session?.accessToken;
    if (!token) {
        notifyError('Veuillez vous connecter pour modifier un utilisateur.');
        router.push('/auth/login');
      return;
    }

      const response = await api.put(
        `/users/${id}`,
        userData.fields,
        {
          headers: {
            Accept: '*/*',
            Authorization: `bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        notifySuccess('Utilisateur modifié avec succès');
        router.push('/users');
      }
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      notifyError('Erreur lors de la modification de l\'utilisateur');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <Box sx={{ p: 4 }}>Chargement...</Box>;
  }

  if (error || !userData) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          <AlertTitle>Erreur</AlertTitle>
          {error || 'Utilisateur non trouvé'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Modifier l'utilisateur
          </Typography>
          <form onSubmit={(e) => e.preventDefault()}>
            <Grid container spacing={7}>
              <Grid item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ImgStyled src={imgSrc} alt="Photo de profil" />
                  {isEditing && (
                    <Box>
                      <ButtonStyled component="label" variant="contained" htmlFor="profile-upload-image">
                        Changer la photo
                        <input
                          hidden
                          type="file"
                          onChange={handlePhotoChange}
                          accept="image/png, image/jpeg"
                          id="profile-upload-image"
                        />
                      </ButtonStyled>
                      <ResetButtonStyled
                        color="error"
                        variant="outlined"
                        onClick={() => {
                          setImgSrc('/images/avatars/1.png');
                          setUserData({ ...userData, fields: { ...userData.fields, Photo: [] } });
                          delete errors.Photo;
                          setErrors({ ...errors });
                        }}
                      >
                        Réinitialiser
                      </ResetButtonStyled>
                      <Typography variant="body2" sx={{ marginTop: 5 }}>
                        PNG ou JPEG autorisés. Taille max : 800 Ko.
                      </Typography>
                      {errors.Photo && (
                        <Typography variant="body2" color="error" sx={{ marginTop: 2 }}>
                          {errors.Photo}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>

              {error && (
                <Grid item xs={12} sx={{ mb: 3 }}>
                  <Alert severity="error">
                    <AlertTitle>Erreur</AlertTitle>
                    {error}
                  </Alert>
                </Grid>
              )}

              {isIndividual && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prénom *"
                      value={userData.fields.FirstName}
                      onChange={handleChange('FirstName')}
                      disabled={!isEditing}
                      error={!!errors.FirstName}
                      helperText={errors.FirstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom *"
                      value={userData.fields.LastName}
                      onChange={handleChange('LastName')}
                      disabled={!isEditing}
                      error={!!errors.LastName}
                      helperText={errors.LastName}
                    />
                  </Grid>
                </>
              )}

              {!isIndividual && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Raison Sociale *"
                    value={userData.fields.raisonSociale || ''}
                    onChange={handleChange('raisonSociale')}
                    disabled={!isEditing}
                    error={!!errors.raisonSociale}
                    helperText={errors.raisonSociale}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email *"
                  value={userData.fields.email}
                  onChange={handleChange('email')}
                  disabled={!isEditing}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={userData.fields.Phone || ''}
                  onChange={handleChange('Phone')}
                  disabled={!isEditing}
                  error={!!errors.Phone}
                  helperText={errors.Phone || 'Exemple: +22952805408'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Adresse"
                  value={userData.fields.Address || ''}
                  onChange={handleChange('Address')}
                  disabled={!isEditing}
                  error={!!errors.Address}
                  helperText={errors.Address}
                />
              </Grid>

              {/* Champs en lecture seule */}
              {!isIndividual && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="IFU"
                    value={userData.fields.ifu || ''}
                    disabled
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Statut"
                  value={userData.fields.Status || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Type de profil"
                  value={userData.fields.profileType.join(', ') || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Produits"
                  value={userData.fields.ProductsName?.join(', ') || 'Aucun produit'}
                  disabled
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/users')}
                    disabled={saving}
                  >
                      Annuler
                    </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {saving ? 'Sauvegarde en cours...' : 'Enregistrer'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default withAuth(EditUserPage);
