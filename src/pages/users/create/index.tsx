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
import { countries } from 'src/utils/countries';
import { API_BASE_URL } from 'src/configs/constants';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

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
  localPhone?: string; // Numéro local sans le code pays
  compteOWO?: string; // Compte OWO pour les agriculteurs
}

// Profils disponibles en dur
const AVAILABLE_PROFILES = [
  { id: 'admin', Type: 'ADMIN' },
  { id: 'acheteur', Type: 'ACHETEUR' },
  { id: 'agriculteur', Type: 'AGRICULTEUR' }
];

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
    profileType: ['ACHETEUR'],
    Photo: null,
    userType: 'individual',
    Country: 'FR',
    localPhone: '',
    compteOWO: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof NewUser, string>>>({});
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png');
  const { notifySuccess, notifyError } = useNotifications();
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
  });

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
        if (!value || (value as string).length < 8) {
          newErrors[field] = 'Le numéro doit contenir au moins 8 chiffres';
        } else if ((value as string).length > 15) {
          newErrors[field] = 'Le numéro ne doit pas dépasser 15 chiffres';
        } else if (!/^\d+$/.test(value as string)) {
          newErrors[field] = 'Le numéro ne doit contenir que des chiffres';
        } else {
          delete newErrors[field];
        }
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
      case 'compteOWO':
        if (value && (value as string).length > 50) {
          newErrors[field] = 'Le compte OWO ne doit pas dépasser 50 caractères';
        } else delete newErrors[field];
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof NewUser) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = field === 'ifu' ? event.target.value : event.target.value;
    setNewUser({ ...newUser, [field]: value });
    validateField(field, value);
    if (field === 'password') {
      setPasswordValidation({
        hasMinLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value)
      });
    }
  };

  const handleLocalPhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const localNumber = event.target.value.replace(/\D/g, ''); // Garder seulement les chiffres
    setNewUser({ ...newUser, localPhone: localNumber });
    validateField('Phone', localNumber);
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
      const selectedCountry = countries.find(c => c.code === newUser.Country);
      const phoneCode = selectedCountry?.phoneCode || '';
      const fullPhone = phoneCode + (newUser.localPhone || '');

      formData.append('email', newUser.email);
      formData.append('password', newUser.password);
      formData.append('Address', newUser.Adresse || '');
      formData.append('profileType', newUser.profileType[0]);
      formData.append('country', countries.find(c => c.code === newUser.Country)?.name || 'France');
      formData.append('Phone', fullPhone);

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

      // Ajouter le compte OWO si c'est un agriculteur
      if (newUser.profileType[0] === 'AGRICULTEUR' && newUser.compteOWO) {
        formData.append('compteOWO', newUser.compteOWO);
      }

      const response = await fetch(`${API_BASE_URL}/users/add`, {
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

            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 2,
                p: 3,
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 2,
                backgroundColor: 'grey.50'
              }}>
                <Box
                  component="img"
                  src={imgSrc}
                  alt="Photo de profil"
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                  id="photo-upload"
                />
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Photo de profil
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                      Choisir une photo
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setImgSrc('/images/avatars/1.png');
                        setNewUser({ ...newUser, Photo: null });
                        delete errors.Photo;
                        setErrors({ ...errors });
                      }}
                    >
                      Supprimer
                    </Button>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Formats : PNG, JPEG, JPG • Max : 800 Ko
                  </Typography>
                  
                  {errors.Photo && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
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
              <FormControl fullWidth>
                <InputLabel>Pays</InputLabel>
                <Select
                  value={newUser.Country}
                  onChange={(e) => setNewUser({ ...newUser, Country: e.target.value })}
                  label="Pays"
                >
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={newUser.Phone || ''}
                onChange={handleChange('Phone')}
                error={!!errors.Phone}
                helperText={errors.Phone || 'Exemple: 61234567'}
              />
            </Grid>
            <Grid item xs={12}>
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
                label="Mot de passe"
                type="password"
                value={newUser.password}
                onChange={handleChange('password')}
                required
                error={!!errors.password}
                helperText={errors.password}
              />
              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                  Le mot de passe doit contenir :
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {passwordValidation.hasMinLength ?
                      <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} /> :
                      <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                    }
                    <Typography variant="caption" color={passwordValidation.hasMinLength ? 'success.main' : 'textSecondary'} sx={{ fontWeight: passwordValidation.hasMinLength ? 600 : 400 }}>
                      Au moins 8 caractères
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {passwordValidation.hasUpperCase ?
                      <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} /> :
                      <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                    }
                    <Typography variant="caption" color={passwordValidation.hasUpperCase ? 'success.main' : 'textSecondary'} sx={{ fontWeight: passwordValidation.hasUpperCase ? 600 : 400 }}>
                      Au moins une majuscule
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {passwordValidation.hasLowerCase ?
                      <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} /> :
                      <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                    }
                    <Typography variant="caption" color={passwordValidation.hasLowerCase ? 'success.main' : 'textSecondary'} sx={{ fontWeight: passwordValidation.hasLowerCase ? 600 : 400 }}>
                      Au moins une minuscule
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {passwordValidation.hasNumber ?
                      <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} /> :
                      <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                    }
                    <Typography variant="caption" color={passwordValidation.hasNumber ? 'success.main' : 'textSecondary'} sx={{ fontWeight: passwordValidation.hasNumber ? 600 : 400 }}>
                      Au moins un chiffre
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Profil</InputLabel>
                <Select
                  value={newUser.profileType[0] || ''}
                  onChange={(e) => setNewUser({ ...newUser, profileType: [e.target.value as string] })}
                  label="Profil"
                >
                  {AVAILABLE_PROFILES.map((profile) => (
                    <MenuItem key={profile.id} value={profile.Type}>
                      {profile.Type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Champ compte OWO pour les agriculteurs */}
            {newUser.profileType[0] === 'AGRICULTEUR' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Compte OWO (optionnel)"
                  value={newUser.compteOWO || ''}
                  onChange={handleChange('compteOWO')}
                  error={!!errors.compteOWO}
                  helperText={errors.compteOWO || 'Compte OWO optionnel pour les agriculteurs'}
                />
              </Grid>
            )}

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
