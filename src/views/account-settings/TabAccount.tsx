import { SyntheticEvent, ChangeEvent, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { getSession } from 'next-auth/react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button, { ButtonProps } from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { styled } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import api from 'src/api/axiosConfig';
import AccountOutline from 'mdi-material-ui/AccountOutline';
import { countries } from 'src/utils/countries';
import { API_BASE_URL } from 'src/configs/constants';

interface ApiResponse {
  id: string;
  fields: {
    FirstName?: string;
    LastName?: string;
    email?: string;
    Phone?: string;
    Address?: string;
    Photo?: Array<{ url: string }>;
    profileType?: string[];
    ProductsName?: string[];
    ifu?: number;
    raisonSociale?: string;
    Status?: string;
    BirthDate?: string;
    country?: string;
    compteOwo?: number;
    reference?: string;
    CreatedDate?: string;
  };
}

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius,
}));

const ButtonStyled = styled(Button)<ButtonProps & { component?: any; htmlFor?: string }>(
  ({ theme }) => ({
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      textAlign: 'center',
    },
  })
);

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4),
  },
}));

interface UserData {
  id: string;
  FirstName: string;
  LastName: string;
  email: string;
  Phone: string;
  Address: string;
  Photo: string | File;
  profileType: string;
  ProductsName: string[];
  ifu: number;
  raisonSociale: string;
  Status: string;
  BirthDate: string;
  country: string;
  compteOwo: number;
  reference: string;
  CreatedDate: string;
}

const TabAccount = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData>({
    id: '',
    FirstName: '',
    LastName: '',
    email: '',
    Phone: '',
    Address: '',
    Photo: '',
    profileType: '',
    ProductsName: [],
    ifu: 0,
    raisonSociale: '',
    Status: '',
    BirthDate: '',
    country: '',
    compteOwo: 0,
    reference: '',
    CreatedDate: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof UserData, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png');
  const [initialData, setInitialData] = useState<UserData>({
    id: '',
    FirstName: '',
    LastName: '',
    email: '',
    Phone: '',
    Address: '',
    Photo: '',
    profileType: '',
    ProductsName: [],
    ifu: 0,
    raisonSociale: '',
    Status: '',
    BirthDate: '',
    country: '',
    compteOwo: 0,
    reference: '',
    CreatedDate: '',
  });

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/auth/login');

      return;
    }

    const fetchUserData = async () => {
      const userId = session?.user?.id;
      const token = session?.accessToken;

      if (!userId || !token) {
        router.push('/auth/login');

        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get(`/users/${userId}`, {
          headers: {
            Accept: '*/*',
            Authorization: `bearer ${token}`,
          },
        });

        const userFields = response.data.fields;
        const photoUrl = userFields.Photo?.[0]?.url || '/images/avatars/1.png';
        const userData = {
          id: response.data.id,
          FirstName: userFields.FirstName || '',
          LastName: userFields.LastName || '',
          email: userFields.email || '',
          Phone: userFields.Phone || '',
          Address: userFields.Address || '',
          Photo: photoUrl,
          profileType: userFields.profileType?.[0] || '',
          ProductsName: userFields.ProductsName || [],
          ifu: userFields.ifu || 0,
          raisonSociale: userFields.raisonSociale || '',
          Status: userFields.Status || '',
          BirthDate: userFields.BirthDate || '',
          country: userFields.country || '',
          compteOwo: userFields.compteOwo || 0,
          reference: userFields.reference || '',
          CreatedDate: userFields.CreatedDate || '',
        };
        setUserData(userData);
        setInitialData(userData);
        setImgSrc(photoUrl);
      } catch (err) {
        setError('Erreur lors de la récupération des données utilisateur');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router, session, status]);

  const validateField = (field: keyof UserData, value: UserData[keyof UserData]) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'FirstName':
        if (typeof value === 'string') {
          if (value.length > 50)
            newErrors[field] = 'Le prénom ne doit pas dépasser 50 caractères';
          else if (!value) newErrors[field] = 'Le prénom est requis';
          else delete newErrors[field];
        }
        break;
      case 'LastName':
        if (typeof value === 'string') {
          if (value.length > 50) newErrors[field] = 'Le nom ne doit pas dépasser 50 caractères';
          else if (!value) newErrors[field] = 'Le nom est requis';
          else delete newErrors[field];
        }
        break;
      case 'email':
        if (typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) newErrors[field] = "Format d'email invalide";
          else delete newErrors[field];
        }
        break;
      case 'Phone':
        if (typeof value === 'string') {
          const phoneRegex = /^\+229\d{8}$/;
          if (value && !phoneRegex.test(value))
            newErrors[field] = 'Numéro invalide (ex. +22952805408)';
          else delete newErrors[field];
        }
        break;
      case 'Address':
        if (typeof value === 'string') {
          if (value.length > 100)
            newErrors[field] = "L'adresse ne doit pas dépasser 100 caractères";
          else delete newErrors[field];
        }
        break;
      case 'raisonSociale':
        if (typeof value === 'string') {
          if (value.length > 100)
            newErrors[field] = "La raison sociale ne doit pas dépasser 100 caractères";
          else delete newErrors[field];
        }
        break;
      case 'BirthDate':
        if (typeof value === 'string') {
          if (value && new Date(value) > new Date()) {
            newErrors[field] = 'La date de naissance ne peut pas être dans le futur';
          } else delete newErrors[field];
        }
        break;
      case 'country':
        if (typeof value === 'string') {
          if (!value) newErrors[field] = 'Le pays est requis';
          else delete newErrors[field];
        }
        break;
      case 'compteOwo':
        if (typeof value === 'number') {
          if (value < 0) newErrors[field] = 'Le compte OWO ne peut pas être négatif';
          else if (value > 999999999) newErrors[field] = 'Le compte OWO ne peut pas dépasser 999999999';
          else delete newErrors[field];
        }
        break;
      case 'ifu':
        if (typeof value === 'number') {
          if (value < 0) newErrors[field] = "L'IFU ne peut pas être négatif";
          else if (value > 999999999) newErrors[field] = "L'IFU ne peut pas dépasser 999999999";
          else delete newErrors[field];
        }
        break;
      case 'Photo':
        if (value instanceof File && value.size > 800 * 1024)
          newErrors[field] = 'La photo ne doit pas dépasser 800 Ko';
        else delete newErrors[field];
        break;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof UserData) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    let processedValue: any = value;
    
    // Convertir les valeurs numériques
    if (field === 'compteOwo' || field === 'ifu') {
      processedValue = value === '' ? 0 : parseInt(value, 10);
      if (isNaN(processedValue)) processedValue = 0;
    }
    
    setUserData({ ...userData, [field]: processedValue });
    validateField(field, processedValue);
  };

  const handleCountryChange = (event: any) => {
    const value = event.target.value;
    setUserData({ ...userData, country: value });
    validateField('country', value);
  };

  const handlePhotoChange = (file: ChangeEvent) => {
    const reader = new FileReader();
    const { files } = file.target as HTMLInputElement;
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string);
      reader.readAsDataURL(files[0]);
      setUserData({ ...userData, Photo: files[0] });
      validateField('Photo', files[0]);
    }
  };

  const handleSave = async () => {
    const fieldsToValidate: (keyof UserData)[] = [
      'FirstName',
      'LastName',
      'Phone',
      'Address',
      'raisonSociale',
      'Photo',
      'BirthDate',
      'country',
      'compteOwo',
      'ifu',
    ];
    let isValid = true;

    fieldsToValidate.forEach((field) => {
      const value = userData[field];
      if (field === 'Photo' && value instanceof File) {
        if (!validateField(field, value)) isValid = false;
      } else if (typeof value === 'string') {
        if (!validateField(field, value)) isValid = false;
      }
    });

    if (!isValid) {
      setError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      const token = session?.accessToken;
      const formData = new FormData();

      if (userData.FirstName !== initialData.FirstName) {
        formData.append('FirstName', userData.FirstName);
      }
      if (userData.LastName !== initialData.LastName) {
        formData.append('LastName', userData.LastName);
      }
      if (userData.Phone !== initialData.Phone) {
        formData.append('Phone', userData.Phone || '');
      }
      if (userData.Address !== initialData.Address) {
        formData.append('Address', userData.Address || '');
      }
      if (userData.raisonSociale !== initialData.raisonSociale) {
        formData.append('raisonSociale', userData.raisonSociale || '');
      }
      if (userData.Photo !== initialData.Photo && userData.Photo instanceof File) {
        formData.append('Photo', userData.Photo);
      }
      if (userData.BirthDate !== initialData.BirthDate) {
        formData.append('BirthDate', userData.BirthDate || '');
      }
      if (userData.country !== initialData.country) {
        formData.append('country', userData.country || '');
      }
      if (userData.compteOwo !== initialData.compteOwo) {
        formData.append('compteOwo', userData.compteOwo.toString());
      }
      if (userData.ifu !== initialData.ifu) {
        formData.append('ifu', userData.ifu.toString());
      }

      if (formData.entries().next().done) {
        setIsEditing(false);
        return;
      }

      const response = await api.put(
        `/users/${userData.id}`,
        formData,
        {
          headers: {
            Authorization: `bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        toast.success('Profil mis à jour avec succès');
        setIsEditing(false);
        setError(null);
        setErrors({});
        setImgSrc(
          userData.Photo instanceof File
            ? URL.createObjectURL(userData.Photo)
            : userData.Photo
        );
        setInitialData(userData);
        
        // Rafraîchir la session pour mettre à jour les données dans la navbar et partout ailleurs
        try {
          await getSession();
        } catch (sessionError) {
          console.error('Erreur lors du rafraîchissement de la session:', sessionError);
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du profil';
      toast.error(errorMessage);
      setError(errorMessage);
      console.error(err);
    }
  };

  if (status === 'loading' || isLoading) {
    return <Box sx={{ p: 4 }}>Chargement...</Box>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <form onSubmit={(e: SyntheticEvent) => e.preventDefault()}>
        {/* Section Photo de profil */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
            Photo de profil
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
              <ImgStyled src={imgSrc} alt="Photo de profil" />
              {isEditing && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <ButtonStyled
                    component="label"
                    variant="contained"
                    htmlFor="profile-upload-image"
                  startIcon={<AccountOutline />}
                  >
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
                      setUserData({ ...userData, Photo: '/images/avatars/1.png' });
                      delete errors.Photo;
                      setErrors({ ...errors });
                    }}
                  >
                    Réinitialiser
                  </ResetButtonStyled>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    PNG ou JPEG autorisés. Taille max : 800 Ko.
                  </Typography>
                  {errors.Photo && (
                    <Typography
                      variant="body2"
                      color="error"
                    sx={{ fontSize: '0.875rem' }}
                    >
                      {errors.Photo}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
        </Box>

          {error && (
          <Box sx={{ mb: 4 }}>
              <Alert severity="error">
                <AlertTitle>Erreur</AlertTitle>
                {error}
              </Alert>
          </Box>
          )}

        {/* Section Informations personnelles */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
            Informations personnelles
          </Typography>
          <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Prénom"
              value={userData.FirstName}
              onChange={handleChange('FirstName')}
              disabled={!isEditing}
              error={!!errors.FirstName}
              helperText={errors.FirstName}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  }
                }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nom"
              value={userData.LastName}
              onChange={handleChange('LastName')}
              disabled={!isEditing}
              error={!!errors.LastName}
              helperText={errors.LastName}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  }
                }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="email"
              label="Email"
              value={userData.email}
              disabled
                sx={{ 
                  '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#666' },
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  }
                }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Téléphone"
              value={userData.Phone || ''}
              onChange={handleChange('Phone')}
              disabled={!isEditing}
              error={!!errors.Phone}
              helperText={errors.Phone || 'Exemple: +22952 805408'}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  }
                }}
            />
          </Grid>
            <Grid item xs={12}>
            <TextField
              fullWidth
              label="Adresse"
              value={userData.Address || ''}
              onChange={handleChange('Address')}
              disabled={!isEditing}
              error={!!errors.Address}
              helperText={errors.Address}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  }
                }}
            />
            </Grid>
          </Grid>
        </Box>

        {/* Section Informations professionnelles */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
            Informations professionnelles
          </Typography>
          <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Raison Sociale"
              value={userData.raisonSociale || ''}
              onChange={handleChange('raisonSociale')}
              disabled={!isEditing}
              error={!!errors.raisonSociale}
              helperText={errors.raisonSociale}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  }
                }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="IFU"
              type="number"
              value={userData.ifu || ''}
              onChange={handleChange('ifu')}
              disabled={!isEditing}
              error={!!errors.ifu}
              helperText={errors.ifu}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  }
                }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Statut"
              value={userData.Status || ''}
              disabled
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  }
                }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Type de profil"
              value={userData.profileType || ''}
              disabled
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  }
                }}
            />
          </Grid>
          {userData.profileType === 'AGRICULTEUR' && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombre de produits"
                value={userData.ProductsName.length}
              disabled
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: 2,
                    }
                  }}
            />
          </Grid>
          )}
          </Grid>
        </Box>

        {/* Section Informations supplémentaires */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
            Informations supplémentaires
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de naissance"
                type="date"
                value={userData.BirthDate || ''}
                onChange={handleChange('BirthDate')}
                disabled={!isEditing}
                error={!!errors.BirthDate}
                helperText={errors.BirthDate}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.country}>
                <InputLabel id="country-label">Pays</InputLabel>
                <Select
                  labelId="country-label"
                  id="country"
                  value={userData.country || ''}
                  onChange={handleCountryChange}
                  disabled={!isEditing}
                label="Pays"
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  }
                }}
                >
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.name}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.country && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ fontSize: '0.75rem', mt: 0.5, ml: 1.5 }}
                  >
                    {errors.country}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Compte OWO"
                type="number"
                value={userData.compteOwo || ''}
                onChange={handleChange('compteOwo')}
                disabled={!isEditing}
                error={!!errors.compteOwo}
                helperText={errors.compteOwo}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Référence"
                value={userData.reference || 'Non renseignée'}
                disabled
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de création"
                value={userData.CreatedDate ? new Date(userData.CreatedDate).toLocaleDateString('fr-FR') : 'Non renseignée'}
                disabled
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Section Actions */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          pt: 3, 
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleSave}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
                >
                  Sauvegarder
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setIsEditing(false)}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
                >
                  Annuler
                </Button>
              </>
            ) : (
            <Button 
              variant="contained" 
              onClick={() => setIsEditing(true)}
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
                Modifier
              </Button>
            )}
        </Box>
      </form>
    </Box>
  );
};

export default TabAccount;