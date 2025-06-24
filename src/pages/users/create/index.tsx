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

// Liste des pays africains et de l'espace Schengen
const countries = [
  // Pays africains
  { code: 'DZ', name: 'Algérie', phoneCode: '+213' },
  { code: 'AO', name: 'Angola', phoneCode: '+244' },
  { code: 'BJ', name: 'Bénin', phoneCode: '+229' },
  { code: 'BW', name: 'Botswana', phoneCode: '+267' },
  { code: 'BF', name: 'Burkina Faso', phoneCode: '+226' },
  { code: 'BI', name: 'Burundi', phoneCode: '+257' },
  { code: 'CM', name: 'Cameroun', phoneCode: '+237' },
  { code: 'CV', name: 'Cap-Vert', phoneCode: '+238' },
  { code: 'CF', name: 'République centrafricaine', phoneCode: '+236' },
  { code: 'TD', name: 'Tchad', phoneCode: '+235' },
  { code: 'KM', name: 'Comores', phoneCode: '+269' },
  { code: 'CG', name: 'République du Congo', phoneCode: '+242' },
  { code: 'CD', name: 'République démocratique du Congo', phoneCode: '+243' },
  { code: 'CI', name: 'Côte d\'Ivoire', phoneCode: '+225' },
  { code: 'DJ', name: 'Djibouti', phoneCode: '+253' },
  { code: 'EG', name: 'Égypte', phoneCode: '+20' },
  { code: 'GQ', name: 'Guinée équatoriale', phoneCode: '+240' },
  { code: 'ER', name: 'Érythrée', phoneCode: '+291' },
  { code: 'ET', name: 'Éthiopie', phoneCode: '+251' },
  { code: 'GA', name: 'Gabon', phoneCode: '+241' },
  { code: 'GM', name: 'Gambie', phoneCode: '+220' },
  { code: 'GH', name: 'Ghana', phoneCode: '+233' },
  { code: 'GN', name: 'Guinée', phoneCode: '+224' },
  { code: 'GW', name: 'Guinée-Bissau', phoneCode: '+245' },
  { code: 'KE', name: 'Kenya', phoneCode: '+254' },
  { code: 'LS', name: 'Lesotho', phoneCode: '+266' },
  { code: 'LR', name: 'Libéria', phoneCode: '+231' },
  { code: 'LY', name: 'Libye', phoneCode: '+218' },
  { code: 'MG', name: 'Madagascar', phoneCode: '+261' },
  { code: 'MW', name: 'Malawi', phoneCode: '+265' },
  { code: 'ML', name: 'Mali', phoneCode: '+223' },
  { code: 'MR', name: 'Mauritanie', phoneCode: '+222' },
  { code: 'MU', name: 'Maurice', phoneCode: '+230' },
  { code: 'MA', name: 'Maroc', phoneCode: '+212' },
  { code: 'MZ', name: 'Mozambique', phoneCode: '+258' },
  { code: 'NA', name: 'Namibie', phoneCode: '+264' },
  { code: 'NE', name: 'Niger', phoneCode: '+227' },
  { code: 'NG', name: 'Nigeria', phoneCode: '+234' },
  { code: 'RW', name: 'Rwanda', phoneCode: '+250' },
  { code: 'ST', name: 'Sao Tomé-et-Principe', phoneCode: '+239' },
  { code: 'SN', name: 'Sénégal', phoneCode: '+221' },
  { code: 'SC', name: 'Seychelles', phoneCode: '+248' },
  { code: 'SL', name: 'Sierra Leone', phoneCode: '+232' },
  { code: 'SO', name: 'Somalie', phoneCode: '+252' },
  { code: 'ZA', name: 'Afrique du Sud', phoneCode: '+27' },
  { code: 'SS', name: 'Soudan du Sud', phoneCode: '+211' },
  { code: 'SD', name: 'Soudan', phoneCode: '+249' },
  { code: 'SZ', name: 'Eswatini', phoneCode: '+268' },
  { code: 'TZ', name: 'Tanzanie', phoneCode: '+255' },
  { code: 'TG', name: 'Togo', phoneCode: '+228' },
  { code: 'TN', name: 'Tunisie', phoneCode: '+216' },
  { code: 'UG', name: 'Ouganda', phoneCode: '+256' },
  { code: 'ZM', name: 'Zambie', phoneCode: '+260' },
  { code: 'ZW', name: 'Zimbabwe', phoneCode: '+263' },
  // Pays de l'espace Schengen
  { code: 'AT', name: 'Autriche', phoneCode: '+43' },
  { code: 'BE', name: 'Belgique', phoneCode: '+32' },
  { code: 'CZ', name: 'République tchèque', phoneCode: '+420' },
  { code: 'DK', name: 'Danemark', phoneCode: '+45' },
  { code: 'EE', name: 'Estonie', phoneCode: '+372' },
  { code: 'FI', name: 'Finlande', phoneCode: '+358' },
  { code: 'FR', name: 'France', phoneCode: '+33' },
  { code: 'DE', name: 'Allemagne', phoneCode: '+49' },
  { code: 'GR', name: 'Grèce', phoneCode: '+30' },
  { code: 'HU', name: 'Hongrie', phoneCode: '+36' },
  { code: 'IS', name: 'Islande', phoneCode: '+354' },
  { code: 'IT', name: 'Italie', phoneCode: '+39' },
  { code: 'LV', name: 'Lettonie', phoneCode: '+371' },
  { code: 'LI', name: 'Liechtenstein', phoneCode: '+423' },
  { code: 'LT', name: 'Lituanie', phoneCode: '+370' },
  { code: 'LU', name: 'Luxembourg', phoneCode: '+352' },
  { code: 'MT', name: 'Malte', phoneCode: '+356' },
  { code: 'NL', name: 'Pays-Bas', phoneCode: '+31' },
  { code: 'NO', name: 'Norvège', phoneCode: '+47' },
  { code: 'PL', name: 'Pologne', phoneCode: '+48' },
  { code: 'PT', name: 'Portugal', phoneCode: '+351' },
  { code: 'SK', name: 'Slovaquie', phoneCode: '+421' },
  { code: 'SI', name: 'Slovénie', phoneCode: '+386' },
  { code: 'ES', name: 'Espagne', phoneCode: '+34' },
  { code: 'SE', name: 'Suède', phoneCode: '+46' },
  { code: 'CH', name: 'Suisse', phoneCode: '+41' }
].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

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
    Country: 'FR',
    localPhone: ''
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
        const selectedCountry = countries.find(c => c.code === newUser.Country);
        const phoneCode = selectedCountry?.phoneCode || '';
        const localNumber = newUser.localPhone || '';
        const fullPhone = phoneCode + localNumber;
        
        if (localNumber && localNumber.length < 8) {
          newErrors[field] = 'Le numéro doit contenir au moins 8 chiffres';
        } else if (localNumber && !/^\d+$/.test(localNumber)) {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof NewUser) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = field === 'ifu' ? event.target.value : event.target.value;
    setNewUser({ ...newUser, [field]: value });
    validateField(field, value);
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
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  minWidth: 'auto',
                  height: 56, 
                  px: 2, 
                  border: '1px solid rgba(0, 0, 0, 0.23)', 
                  borderRight: 'none',
                  borderTopLeftRadius: theme => theme.shape.borderRadius,
                  borderBottomLeftRadius: theme => theme.shape.borderRadius,
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  color: 'text.secondary',
                  fontSize: '1rem',
                  whiteSpace: 'nowrap'
                }}>
                  {countries.find(c => c.code === newUser.Country)?.phoneCode || '+33'}
                </Box>
              <TextField
                fullWidth
                label="Téléphone"
                  value={newUser.localPhone || ''}
                  onChange={handleLocalPhoneChange}
                error={!!errors.Phone}
                  helperText={errors.Phone || 'Exemple: 61234567'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                    }
                  }}
              />
              </Box>
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
