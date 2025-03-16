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
import IconButton from '@mui/material/IconButton';

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
  Address?: string;
  raisonSociale?: string; // Entreprise uniquement
  ifu?: number; // Entreprise uniquement
  password: string;
  profileType: string[];
  Photo?: File | null;
  userType: 'individual' | 'company'; // Nouveau champ pour distinguer particulier/entreprise
}

const CreateUserPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    FirstName: '',
    LastName: '',
    BirthDate: '',
    Phone: '',
    Address: '',
    raisonSociale: '',
    ifu: undefined,
    password: '',
    profileType: ['USER'],
    Photo: null,
    userType: 'individual', // Par défaut, particulier
  });
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<{ id: string; Type: string }[]>([]);
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png'); // Image par défaut

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
        const response = await api.get('https://agriconnect-bc17856a61b8.herokuapp.com/profiles', {
          headers: {
            Accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        });
        setProfiles(
          response.data.map((profile: any) => ({
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

  // Gérer les changements dans les champs
  const handleChange = (field: keyof NewUser) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = field === 'ifu' ? Number(event.target.value) || undefined : event.target.value;
    setNewUser({
      ...newUser,
      [field]: value,
    });
  };

  // Gérer le changement de photo
  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewUser({ ...newUser, Photo: file });
      const reader = new FileReader();
      reader.onload = () => setImgSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Gérer le changement de type d'utilisateur
  const handleUserTypeChange = (event: ChangeEvent<{ value: unknown }>) => {
    const userType = event.target.value as 'individual' | 'company';
    setNewUser({
      ...newUser,
      userType,
      // Réinitialiser les champs spécifiques au type précédent
      ...(userType === 'individual'
        ? { raisonSociale: '', ifu: undefined }
        : { FirstName: '', LastName: '', BirthDate: '' }),
    });
  };

  const handleCreate = async () => {
    const token = session?.accessToken;
    if (!token) {
      setError('Veuillez vous connecter pour créer un utilisateur.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('fields[email]', newUser.email);
      formData.append('fields[password]', newUser.password);
      formData.append('fields[profileType][0]', newUser.profileType[0]);
      formData.append('fields[Status]', 'Activated');
      if (newUser.Phone) formData.append('fields[Phone]', newUser.Phone);
      if (newUser.Address) formData.append('fields[Address]', newUser.Address);
      if (newUser.Photo) formData.append('fields[Photo]', newUser.Photo);

      if (newUser.userType === 'individual') {
        formData.append('fields[FirstName]', newUser.FirstName || '');
        formData.append('fields[LastName]', newUser.LastName || '');
        if (newUser.BirthDate) formData.append('fields[BirthDate]', newUser.BirthDate);
      } else {
        formData.append('fields[raisonSociale]', newUser.raisonSociale || '');
        if (newUser.ifu) formData.append('fields[ifu]', newUser.ifu.toString());
      }

      const response = await api.post('https://agriconnect-bc17856a61b8.herokuapp.com/users', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        router.push('/users/manage');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l’utilisateur');
      console.error(err);
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
            {/* Sélection du type d'utilisateur */}
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

            {/* Photo */}
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
                    }}
                  >
                    Réinitialiser
                  </ResetButtonStyled>
                  <Typography variant="body2" sx={{ marginTop: 2 }}>
                    PNG ou JPEG autorisés. Taille max : 800 Ko.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Champs communs */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={newUser.email}
                onChange={handleChange('email')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={newUser.Phone || ''}
                onChange={handleChange('Phone')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Adresse"
                value={newUser.Address || ''}
                onChange={handleChange('Address')}
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Profil</InputLabel>
                <Select
                  value={newUser.profileType[0] || ''}
                  onChange={e => setNewUser({ ...newUser, profileType: [e.target.value as string] })}
                  label="Profil"
                >
                  {profiles.map(profile => (
                    <MenuItem key={profile.id} value={profile.Type}>
                      {profile.Type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Champs spécifiques au particulier */}
            {newUser.userType === 'individual' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    value={newUser.FirstName || ''}
                    onChange={handleChange('FirstName')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
價值                    value={newUser.LastName || ''}
                    onChange={handleChange('LastName')}
                    required
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
                  />
                </Grid>
              </>
            )}

            {/* Champs spécifiques à l'entreprise */}
            {newUser.userType === 'company' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Raison Sociale"
                    value={newUser.raisonSociale || ''}
                    onChange={handleChange('raisonSociale')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="IFU"
                    type="number"
                    value={newUser.ifu || ''}
                    onChange={handleChange('ifu')}
                  />
                </Grid>
              </>
            )}

            {/* Boutons */}
            <Grid item xs={12}>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => router.push('/users/manage')}>
                  Annuler
                </Button>
                <Button variant="contained" onClick={handleCreate}>
                  Créer
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateUserPage;