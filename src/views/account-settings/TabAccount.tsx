import { SyntheticEvent, ChangeEvent, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button, { ButtonProps } from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { styled } from '@mui/material/styles';
import api from 'src/api/axiosConfig';

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
    Status: ''
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
        const response = await api.get<ApiResponse>(
          `https://agriconnect-bc17856a61b8.herokuapp.com/users/${userId}`,
          {
            headers: {
              Accept: '*/*',
              Authorization: `bearer ${token}`,
            },
          }
        );

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
    setUserData({ ...userData, [field]: value });
    validateField(field, value);
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

      if (formData.entries().next().done) {
        setIsEditing(false);
        return;
      }

      const response = await api.put(
        `https://agriconnect-bc17856a61b8.herokuapp.com/users/${userData.id}`,
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
        <Grid container spacing={7}>
          <Grid item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ImgStyled src={imgSrc} alt="Photo de profil" />
              {isEditing && (
                <Box>
                  <ButtonStyled
                    component="label"
                    variant="contained"
                    htmlFor="profile-upload-image"
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
                  <Typography variant="body2" sx={{ marginTop: 5 }}>
                    PNG ou JPEG autorisés. Taille max : 800 Ko.
                  </Typography>
                  {errors.Photo && (
                    <Typography
                      variant="body2"
                      color="error"
                      sx={{ marginTop: 2 }}
                    >
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

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Prénom"
              value={userData.FirstName}
              onChange={handleChange('FirstName')}
              disabled={!isEditing}
              error={!!errors.FirstName}
              helperText={errors.FirstName}
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
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="email"
              label="Email"
              value={userData.email}
              disabled
              sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#666' } }}
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
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Adresse"
              value={userData.Address || ''}
              onChange={handleChange('Address')}
              disabled={!isEditing}
              error={!!errors.Address}
              helperText={errors.Address}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Raison Sociale"
              value={userData.raisonSociale || ''}
              onChange={handleChange('raisonSociale')}
              disabled={!isEditing}
              error={!!errors.raisonSociale}
              helperText={errors.raisonSociale}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="IFU"
              value={userData.ifu || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Statut"
              value={userData.Status || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Type de profil"
              value={userData.profileType || ''}
              disabled
            />
          </Grid>
          {userData.profileType === 'AGRICULTEUR' && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombre de produits"
                value={userData.ProductsName.length}
              disabled
            />
          </Grid>
          )}

          <Grid item xs={12}>
            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  sx={{ marginRight: 3.5 }}
                  onClick={handleSave}
                >
                  Sauvegarder
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Annuler
                </Button>
              </>
            ) : (
              <Button variant="contained" onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
            )}
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default TabAccount;