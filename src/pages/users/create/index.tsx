import { withAuth } from '@/components/auth/withAuth';
import { useState, useEffect, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { styled } from '@mui/material/styles';
import api from 'src/api/axiosConfig';
import { toast } from 'react-hot-toast';
import { useNotifications } from '@/hooks/useNotifications';
import CircularProgress from '@mui/material/CircularProgress';

// Styles pour la photo
const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius,
}));

const ButtonStyled = styled(Button)<{ component?: any; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center',
  },
}));

const ResetButtonStyled = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4),
  },
}));

interface NewUser {
  email: string;
  FirstName?: string; // Particulier uniquement
  LastName?: string; // Particulier uniquement
  BirthDate?: string; // Particulier uniquement
  Phone?: string;
  Adresse?: string;
  raisonSociale?: string; // Entreprise uniquement
  ifu?: number; // Entreprise uniquement
  password: string;
  profileType: string[];
  Photo?: File | null;
  userType: 'individual' | 'company';
  Country: string;
}

interface Profile {
  id: string;
  fields: {
    Type: string;
  };
}

const CreateUserPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    FirstName: '',
    LastName: '',
    BirthDate: '',
    Phone: '',
    Adresse: '',
    raisonSociale: '',
    ifu: undefined,
    password: '',
    profileType: ['USER'],
    Photo: null,
    userType: 'individual',
    Country: 'France'
  });
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof NewUser, string>>>({});
  const [profiles, setProfiles] = useState<{ id: string; Type: string }[]>([]);
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png');
  const { notifySuccess, notifyError } = useNotifications();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    const fetchProfiles = async () => {
      const token = session?.accessToken;
      if (!token) return;

      try {
        const response = await api.get<Profile[]>('https://agriconnect-bc17856a61b8.herokuapp.com/profiles', {
          headers: {
            Accept: '*/*',
            Authorization: `bearer ${token}`,
          },
        });
        setProfiles(
          response.data.map((profile) => ({
            id: profile.id,
            Type: profile.fields.Type,
          }))
        );
      } catch (err) {
        console.error('Erreur lors de la récupération des profils:', err);
      }
    };

    fetchProfiles();
  }, [status, router, session]);

  const validateField = (field: keyof NewUser, value: string | File | undefined | null) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) newErrors[field] = "L'email est requis";
        else if (!emailRegex.test(value as string)) newErrors[field] = "Format d'email invalide";
        else delete newErrors[field];
        break;
      case 'FirstName':
        if (newUser.userType === 'individual') {
          if (!value) newErrors[field] = 'Le prénom est requis';
          else if ((value as string).length > 50) newErrors[field] = 'Le prénom ne doit pas dépasser 50 caractères';
          else delete newErrors[field];
        }
        break;
      case 'LastName':
        if (newUser.userType === 'individual') {
          if (!value) newErrors[field] = 'Le nom est requis';
          else if ((value as string).length > 50) newErrors[field] = 'Le nom ne doit pas dépasser 50 caractères';
          else delete newErrors[field];
        }
        break;
      case 'BirthDate':
        if (value) {
          const birthDate = new Date(value as string);
          if (birthDate >= new Date()) newErrors[field] = 'La date de naissance doit être dans le passé';
          else delete newErrors[field];
        } else delete newErrors[field];
        break;
      case 'Phone':
        const phoneRegex = /^\+229\d{8}$/;
        if (value && !phoneRegex.test(value as string))
          newErrors[field] = 'Numéro invalide (ex. +22952805408)';
        else delete newErrors[field];
        break;
      case 'Adresse':
        if (value && (value as string).length > 100)
          newErrors[field] = "L'adresse ne doit pas dépasser 100 caractères";
        else delete newErrors[field];
        break;
      case 'raisonSociale':
        if (newUser.userType === 'company') {
          if (!value) newErrors[field] = 'La raison sociale est requise';
          else if ((value as string).length > 100)
            newErrors[field] = 'La raison sociale ne doit pas dépasser 100 caractères';
          else delete newErrors[field];
        }
        break;
      case 'ifu':
        if (value && typeof value === 'string' && Number(value) < 0) newErrors[field] = "L'IFU doit être un nombre positif";
        else delete newErrors[field];
        break;
      case 'password':
        if (!value) newErrors[field] = 'Le mot de passe est requis';
        else if ((value as string).length < 8) newErrors[field] = 'Le mot de passe doit contenir au moins 8 caractères';
        else delete newErrors[field];
        break;
      case 'Photo':
        if (value instanceof File && value.size > 800 * 1024)
          newErrors[field] = 'La photo ne doit pas dépasser 800 Ko';
        else delete newErrors[field];
        break;
      case 'Country':
        if (!value) newErrors[field] = 'Le pays est requis';
        else delete newErrors[field];
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof NewUser) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = field === 'ifu' ? event.target.value : event.target.value;
    setNewUser({ ...newUser, [field]: value });
    validateField(field, value);
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewUser({ ...newUser, Photo: file });
      const reader = new FileReader();
      reader.onload = () => setImgSrc(reader.result as string);
      reader.readAsDataURL(file);
      validateField('Photo', file);
    }
  };

  const handleUserTypeChange = (event: any) => {
    const userType = event.target.value as 'individual' | 'company';
    setNewUser({
      ...newUser,
      userType,
      ...(userType === 'individual'
        ? { raisonSociale: '', ifu: undefined }
        : { FirstName: '', LastName: '', BirthDate: '' }),
    });
    setErrors({});
  };

  const handleCreate = async () => {
    const fieldsToValidate: (keyof NewUser)[] = [
      'email',
      'password',
      'Phone',
      'Adresse',
      'Photo',
      'Country',
      ...(newUser.userType === 'individual'
        ? (['FirstName', 'LastName', 'BirthDate'] as (keyof NewUser)[])
        : (['raisonSociale', 'ifu'] as (keyof NewUser)[])),
    ];
    let isValid = true;

    fieldsToValidate.forEach((field) => {
      let value: string | File | null | undefined;
      if (field === 'ifu') {
        value = newUser[field]?.toString();
      } else if (field === 'profileType') {
        value = newUser[field][0];
      } else {
        value = newUser[field] as string | File | null | undefined;
      }
      if (!validateField(field, value)) isValid = false;
    });

    if (!isValid) {
      notifyError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    const token = session?.accessToken;
    if (!token) {
      notifyError('Veuillez vous connecter pour créer un utilisateur');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', newUser.email);
      formData.append('password', newUser.password);
      formData.append('Address', newUser.Adresse || '');
      formData.append('profileType', newUser.profileType[0]);
      formData.append('country', newUser.Country);
      formData.append('Phone', newUser.Phone || '');

      if (newUser.userType === 'individual') {
        formData.append('FirstName', newUser.FirstName || '');
        formData.append('LastName', newUser.LastName || '');
        formData.append('BirthDate', newUser.BirthDate || '');
      } else {
        formData.append('raisonSociale', newUser.raisonSociale || '');
        formData.append('ifu', newUser.ifu?.toString() || '');
      }

      if (newUser.Photo) {
        formData.append('Photo', newUser.Photo);
      }

      const response = await fetch('https://agriconnect-bc17856a61b8.herokuapp.com/users/add  ', {
        method: 'POST',
        headers: {
          Authorization: `bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        notifySuccess('Utilisateur créé avec succès');
        router.push('/users');
      } else {
        const errorData = await response.json();
        notifyError(errorData.message || 'Erreur lors de la création de l\'utilisateur');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      notifyError('Erreur lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <Box sx={{ p: 4 }}>Chargement...</Box>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Créer un nouvel utilisateur
          </Typography>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type d'utilisateur</InputLabel>
                <Select
                  value={newUser.userType}
                  onChange={handleUserTypeChange}
                  label="Type d'utilisateur"
                >
                  <MenuItem value="individual">Particulier</MenuItem>
                  <MenuItem value="company">Entreprise</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ImgStyled src={imgSrc} alt="Photo de profil" />
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
                      setNewUser({ ...newUser, Photo: null });
                      delete errors.Photo;
                      setErrors({ ...errors });
                    }}
                  >
                    Réinitialiser
                  </ResetButtonStyled>
                  <Typography variant="body2" sx={{ marginTop: 2 }}>
                    PNG ou JPEG autorisés. Taille max : 800 Ko.
                  </Typography>
                  {errors.Photo && (
                    <Typography variant="body2" color="error" sx={{ marginTop: 2 }}>
                      {errors.Photo}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={newUser.email}
                onChange={handleChange('email')}
                required
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={newUser.Phone || ''}
                onChange={handleChange('Phone')}
                error={!!errors.Phone}
                helperText={errors.Phone || 'Exemple: +22952805408'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Adresse"
                value={newUser.Adresse || ''}
                onChange={handleChange('Adresse')}
                error={!!errors.Adresse}
                helperText={errors.Adresse}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pays"
                value={newUser.Country}
                onChange={handleChange('Country')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mot de passe"
                type="password"
                value={newUser.password}
                onChange={handleChange('password')}
                required
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Profil</InputLabel>
                <Select
                  value={newUser.profileType[0] || ''}
                  onChange={(e) => setNewUser({ ...newUser, profileType: [e.target.value as string] })}
                  label="Profil"
                >
                  {profiles.map((profile) => (
                    <MenuItem key={profile.id} value={profile.Type}>
                      {profile.Type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {newUser.userType === 'individual' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    value={newUser.FirstName || ''}
                    onChange={handleChange('FirstName')}
                    required
                    error={!!errors.FirstName}
                    helperText={errors.FirstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    value={newUser.LastName || ''}
                    onChange={handleChange('LastName')}
                    required
                    error={!!errors.LastName}
                    helperText={errors.LastName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date de naissance"
                    type="date"
                    value={newUser.BirthDate || ''}
                    onChange={handleChange('BirthDate')}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.BirthDate}
                    helperText={errors.BirthDate}
                  />
                </Grid>
              </>
            )}

            {newUser.userType === 'company' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Raison Sociale"
                    value={newUser.raisonSociale || ''}
                    onChange={handleChange('raisonSociale')}
                    required
                    error={!!errors.raisonSociale}
                    helperText={errors.raisonSociale}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="IFU"
                    type="number"
                    value={newUser.ifu || ''}
                    onChange={handleChange('ifu')}
                    error={!!errors.ifu}
                    helperText={errors.ifu}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => router.push('/users')} disabled={loading}>
                  Annuler
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleCreate}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Création en cours...' : 'Créer'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default withAuth(CreateUserPage);
