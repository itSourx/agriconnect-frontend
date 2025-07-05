import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
  Box, Card, CardContent, Typography, Avatar, CircularProgress, Grid, Chip, Divider,
  IconButton, useTheme, useMediaQuery, Paper
} from '@mui/material'
import { styled, alpha } from '@mui/material/styles'
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
  Photo as PhotoIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material'
import api from 'src/api/axiosConfig'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from 'src/configs/constants'

interface UserDetails {
  id: string
  createdTime: string
  fields: {
    email: string
    Status?: string
    FirstName?: string
    LastName?: string
    profileType: string[]
    Phone?: string
    Address?: string
    Photo?: Array<{
      id: string
      width: number
      height: number
      url: string
      filename: string
      size: number
      type: string
      thumbnails: {
        small: { url: string; width: number; height: number }
        large: { url: string; width: number; height: number }
        full: { url: string; width: number; height: number }
      }
    }>
    BirthDate?: string
    password?: string
    profileId?: string[]
    PasswordChangedDate?: string
    isPassReseted?: string
    name?: string
    reference?: string
    country?: string
    raisonSociale?: string
    ifu?: number
    ProductsName?: string[]
  }
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px 0 rgba(0,0,0,0.08)',
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px 0 rgba(0,0,0,0.12)'
  }
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  padding: theme.spacing(4),
  borderRadius: '16px 16px 0 0',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: alpha(theme.palette.background.paper, 0.9),
    borderRadius: '16px 16px 0 0'
  }
}));

const InfoSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  '& .info-item': {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    borderRadius: 12,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      transform: 'translateX(4px)'
    },
    '&:last-child': {
      marginBottom: 0
    }
  },
  '& .info-icon': {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing(2),
    flexShrink: 0
  },
  '& .info-content': {
    flex: 1,
    minWidth: 0
  },
  '& .info-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
    fontWeight: 500
  },
  '& .info-value': {
    fontSize: '1rem',
    color: theme.palette.text.primary,
    fontWeight: 600
  }
}));

const UserDetailsPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    if (status === 'loading' || !id) return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchUserDetails = async () => {
      const token = session?.accessToken
      if (!token) {
        setError('Veuillez vous connecter pour voir les détails de l\'utilisateur.')
        router.push('/auth/login')
        return
      }

      try {
        setLoading(true)
        const response = await api.get(`${API_BASE_URL}/users/${id}`, {
          headers: {
            Accept: '*/*',
            Authorization: `bearer ${token}`
          }
        })
        setUserDetails(response.data as UserDetails)
      } catch (err: any) {
        setError('Erreur lors de la récupération des détails de l\'utilisateur')
        console.error('Erreur API:', err)
        toast.error('Erreur lors de la récupération des détails de l\'utilisateur')
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [router, session, status, id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getProfileTypeColor = (profileType: string) => {
    const colors: Record<string, "primary" | "success" | "warning" | "error"> = {
      'AGRICULTEUR': 'success',
      'ACHETEUR': 'primary',
      'ADMIN': 'warning',
      'SUPERADMIN': 'error'
    }
    return colors[profileType] || 'default'
  }

  const InfoItem = ({ icon, label, value, color = 'primary' }: {
    icon: React.ReactNode
    label: string
    value: string | number | undefined
    color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  }) => (
    <Box className="info-item">
      <Box 
        className="info-icon"
        sx={{ 
          bgcolor: alpha(theme.palette[color].main, 0.1),
          color: theme.palette[color].main
        }}
      >
        {icon}
      </Box>
      <Box className="info-content">
        <Typography className="info-label">{label}</Typography>
        <Typography className="info-value">
          {value || 'Non renseigné'}
        </Typography>
      </Box>
    </Box>
  )

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ bgcolor: 'background.default' }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box 
        p={4} 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ bgcolor: 'background.default' }}
      >
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    )
  }

  if (!userDetails) {
    return (
      <Box 
        p={4} 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ bgcolor: 'background.default' }}
      >
        <Typography color="error" variant="h6">Utilisateur non trouvé</Typography>
      </Box>
    )
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
        px: { xs: 2, sm: 4, md: 6 }
      }}
    >
      {/* Header */}
      <Box 
        display="flex" 
        alignItems="center" 
        mb={4}
        sx={{ maxWidth: 1400, mx: 'auto' }}
      >
        <IconButton 
          onClick={() => router.back()} 
          sx={{ 
            mr: 3,
            bgcolor: 'white',
            boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)',
            '&:hover': {
              bgcolor: 'white',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px 0 rgba(0,0,0,0.15)'
            }
          }}
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Profil Utilisateur
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Grid container spacing={4}>
          {/* Carte principale avec photo et infos de base */}
          <Grid item xs={12} lg={4}>
            <StyledCard>
              <ProfileHeader>
                <Box sx={{ position: 'relative', textAlign: 'center' }}>
                  {userDetails.fields.Photo && userDetails.fields.Photo[0]?.url ? (
                    <Avatar
                      src={userDetails.fields.Photo[0].url}
                      alt="Photo de profil"
                      sx={{ 
                        width: 120, 
                        height: 120,
                        mx: 'auto',
                        mb: 3,
                        border: `4px solid white`,
                        boxShadow: '0 8px 24px 0 rgba(0,0,0,0.15)'
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{ 
                        width: 120, 
                        height: 120,
                        mx: 'auto',
                        mb: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontSize: '3rem',
                        border: `4px solid white`,
                        boxShadow: '0 8px 24px 0 rgba(0,0,0,0.15)'
                      }}
                    >
                      {userDetails.fields.FirstName?.[0] || userDetails.fields.LastName?.[0] || <AccountCircleIcon />}
                    </Avatar>
                  )}

                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                    {userDetails.fields.FirstName} {userDetails.fields.LastName}
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                    {userDetails.fields.email}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                    {userDetails.fields.profileType?.map((type, index) => (
                      <Chip
                        key={index}
                        label={type}
                        color={getProfileTypeColor(type)}
                        size="medium"
                        variant="filled"
                        sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                      />
                    ))}
                  </Box>

                  <Chip
                    label={userDetails.fields.Status === 'Activated' ? 'Compte Activé' : 'Compte Désactivé'}
                    color={userDetails.fields.Status === 'Activated' ? 'success' : 'error'}
                    size="medium"
                    variant="filled"
                    sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                  />
                </Box>
              </ProfileHeader>

              {userDetails.fields.reference && (
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
                  <Typography variant="overline" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                    Référence Utilisateur
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main, letterSpacing: 1 }}>
                    {userDetails.fields.reference}
                  </Typography>
                </Box>
              )}
            </StyledCard>
          </Grid>

          {/* Informations détaillées */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              {/* Informations personnelles */}
              <Grid item xs={12}>
                <StyledCard>
                  <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Informations Personnelles
                    </Typography>
                  </Box>
                  <InfoSection>
                    <InfoItem
                      icon={<EmailIcon />}
                      label="Adresse Email"
                      value={userDetails.fields.email}
                      color="primary"
                    />
                    <InfoItem
                      icon={<PhoneIcon />}
                      label="Numéro de Téléphone"
                      value={userDetails.fields.Phone}
                      color="success"
                    />
                    <InfoItem
                      icon={<LocationOnIcon />}
                      label="Adresse"
                      value={userDetails.fields.Address}
                      color="info"
                    />
                    <InfoItem
                      icon={<CalendarTodayIcon />}
                      label="Date de Naissance"
                      value={userDetails.fields.BirthDate ? formatDate(userDetails.fields.BirthDate) : undefined}
                      color="warning"
                    />
                    {userDetails.fields.country && (
                      <InfoItem
                        icon={<LocationOnIcon />}
                        label="Pays"
                        value={userDetails.fields.country}
                        color="info"
                      />
                    )}
                  </InfoSection>
                </StyledCard>
              </Grid>

              {/* Informations professionnelles */}
              {(userDetails.fields.raisonSociale || userDetails.fields.ifu || userDetails.fields.ProductsName) && (
                <Grid item xs={12}>
                  <StyledCard>
                    <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        Informations Professionnelles
                      </Typography>
                    </Box>
                    <InfoSection>
                      {userDetails.fields.raisonSociale && (
                        <InfoItem
                          icon={<BusinessIcon />}
                          label="Raison Sociale"
                          value={userDetails.fields.raisonSociale}
                          color="primary"
                        />
                      )}
                      {userDetails.fields.ifu && (
                        <InfoItem
                          icon={<BusinessIcon />}
                          label="Numéro IFU"
                          value={userDetails.fields.ifu.toString()}
                          color="success"
                        />
                      )}
                      {userDetails.fields.ProductsName && userDetails.fields.ProductsName.length > 0 && (
                        <Box className="info-item">
                          <Box 
                            className="info-icon"
                            sx={{ 
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              color: theme.palette.warning.main
                            }}
                          >
                            <PhotoIcon />
                          </Box>
                          <Box className="info-content">
                            <Typography className="info-label">Produits</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                              {userDetails.fields.ProductsName.map((product, index) => (
                                <Chip
                                  key={index}
                                  label={product}
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  sx={{ fontWeight: 500 }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </InfoSection>
                  </StyledCard>
                </Grid>
              )}

              {/* Informations système */}
              <Grid item xs={12}>
                <StyledCard>
                  <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center' }}>
                      <SecurityIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Informations Système
                    </Typography>
                  </Box>
                  <InfoSection>
                    <InfoItem
                      icon={<CalendarTodayIcon />}
                      label="Date de Création du Compte"
                      value={formatDate(userDetails.createdTime)}
                      color="primary"
                    />
                    {userDetails.fields.PasswordChangedDate && (
                      <InfoItem
                        icon={<SecurityIcon />}
                        label="Dernière Modification du Mot de Passe"
                        value={formatDate(userDetails.fields.PasswordChangedDate)}
                        color="warning"
                      />
                    )}
                    <InfoItem
                      icon={userDetails.fields.isPassReseted === 'Yes' ? <SecurityIcon /> : <VerifiedUserIcon />}
                      label="Mot de Passe Réinitialisé"
                      value={userDetails.fields.isPassReseted === 'Yes' ? 'Oui' : 'Non'}
                      color={userDetails.fields.isPassReseted === 'Yes' ? 'warning' : 'success'}
                    />
                  </InfoSection>
                </StyledCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default UserDetailsPage 