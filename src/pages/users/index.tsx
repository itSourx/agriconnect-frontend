// Remplace les imports existants par ceci :
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import DeleteIcon from '@mui/icons-material/Delete'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import TablePagination from '@mui/material/TablePagination'
import Button from '@mui/material/Button'
import * as XLSX from 'xlsx'
import api from 'src/api/axiosConfig'
import Avatar from '@mui/material/Avatar'
import PersonIcon from '@mui/icons-material/Person'
import CircularProgress from '@mui/material/CircularProgress'
import { toast } from 'react-hot-toast'
import Switch from '@mui/material/Switch'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { styled, alpha } from '@mui/material/styles'
import {
  Group as GroupIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Add as AddIcon
} from '@mui/icons-material'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'

interface User {
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
    ProductsName?: string[]
    ifu?: number
    raisonSociale?: string
    Photo?: { url: string }[]
  }
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.1)'
  }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': { 
    fontWeight: 'bold',
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderBottom: 'none'
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02)
  },
  '&:last-child td, &:last-child th': { border: 0 },
}));

const UsersManagementPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [profileTypeFilter, setProfileTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const itemsPerPage = 15
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [lockingUserId, setLockingUserId] = useState<string | null>(null)

  const profileTypeColors: Record<string, "primary" | "success" | "warning"> = {
    AGRICULTEUR: "success",
    USER: "primary",
    ADMIN: "warning"
  };

  // Charger les utilisateurs au montage
  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchUsers = async () => {
      const token = session?.accessToken
      if (!token) {
        setError('Veuillez vous connecter pour voir les utilisateurs.')
        router.push('/auth/login')
        return
      }

      try {
        setLoading(true)
        const response = await api.get('https://agriconnect-bc17856a61b8.herokuapp.com/users', {
          headers: {
            Accept: '*/*',
            Authorization: `bearer ${token}`
          }
        })
        setAllUsers(response.data as User[])
        setFilteredUsers(response.data as User[])
        // console.log('Statuts des utilisateurs:', (response.data as User[]).map((user: User) => user.fields.Status))
      } catch (err) {
        setError('Erreur lors de la récupération des utilisateurs')
        console.error('Erreur API:', err) // Log détaillé pour déboguer
      } finally {
        setLoading(false) // Toujours désactiver le chargement, succès ou échec
      }
    }

    fetchUsers()
  }, [router, session, status])

  useEffect(() => {
    let filtered = allUsers.filter(
      user =>
        `${user.fields.FirstName || ''} ${user.fields.LastName || ''}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) || user.fields.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (profileTypeFilter) {
      filtered = filtered.filter(user => user.fields.profileType.includes(profileTypeFilter))
    }

    if (statusFilter) {
      filtered = filtered.filter(user => user.fields.Status === statusFilter)
    }

    setFilteredUsers(filtered)
    setPage(1)
  }, [searchTerm, profileTypeFilter, statusFilter, allUsers]) // Ajout des dépendances

  useEffect(() => {
    if (session?.user?.profileType?.includes('SUPERADMIN')) {
      setIsSuperAdmin(true)
    }
  }, [session])

  // Supprimer un utilisateur
  const handleDelete = async (userId: string) => {
    const token = session?.accessToken
    if (!token) {
      setError('Veuillez vous connecter pour supprimer un utilisateur.')
      return
    }

    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      try {
        setDeletingUserId(userId)
        await api.delete(`https://agriconnect-bc17856a61b8.herokuapp.com/users/${userId}`, {
          headers: {
            Authorization: `bearer ${token}`
          }
        })
        setAllUsers(allUsers.filter(user => user.id !== userId))
        setFilteredUsers(filteredUsers.filter(user => user.id !== userId))
        toast.success('Utilisateur supprimé avec succès')
      } catch (err) {
        setError("Erreur lors de la suppression de l'utilisateur")
        toast.error("Erreur lors de la suppression de l'utilisateur")
        console.error('Erreur suppression:', err)
      } finally {
        setDeletingUserId(null)
      }
    }
  }

  // Exporter les utilisateurs en Excel
  const handleExport = () => {
    const exportData = filteredUsers.map(user => ({
      ID: user.id,
      Nom: `${user.fields.FirstName || ''} ${user.fields.LastName || ''}`,
      Email: user.fields.email,
      'Type de profil': user.fields.profileType.join(', '),
      Statut: user.fields.Status || 'N/A',
      Téléphone: user.fields.Phone || 'N/A'
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Utilisateurs')
    XLSX.writeFile(workbook, 'utilisateurs.xlsx')
  }

  const profileTypes = ['AGRICULTEUR', 'USER', 'ADMIN']
  const statuses = ['Activated', 'Deactivated', 'Pending']

  const handleLockUser = async (userId: string, currentStatus: string) => {
    try {
      setLockingUserId(userId)
      const token = session?.accessToken
      if (!token) {
        toast.error('Session expirée, veuillez vous reconnecter')
        router.push('/auth/login')
        return
      }

      const endpoint = currentStatus === 'Activated' ? 'lock' : 'unlock'
      const response = await api.post(
        `https://agriconnect-bc17856a61b8.herokuapp.com/users/${endpoint}`,
        { userId },
        {
          headers: {
            Accept: '*/*',
            Authorization: `bearer ${token}`,
          },
        }
      )

      if (response.status === 200) {
        toast.success(`Utilisateur ${currentStatus === 'Activated' ? 'désactivé' : 'activé'} avec succès`)
        // Rafraîchir la liste des utilisateurs
        const updatedResponse = await api.get('https://agriconnect-bc17856a61b8.herokuapp.com/users', {
          headers: {
            Accept: '*/*',
            Authorization: `bearer ${token}`
          }
        })
        setAllUsers(updatedResponse.data as User[])
        setFilteredUsers(updatedResponse.data as User[])
      }
    } catch (err: any) {
      console.error('Erreur lors du changement de statut:', err)
      if (err?.response?.status === 401) {
        toast.error('Session expirée, veuillez vous reconnecter')
        router.push('/auth/login')
      } else {
        toast.error(err?.response?.data?.message || 'Erreur lors du changement de statut de l\'utilisateur')
      }
    } finally {
      setLockingUserId(null)
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color='error'>{error}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ padding: 4 }}>
      <StyledCard>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <GroupIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Gestion des utilisateurs</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant='outlined'
                color='secondary'
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                size="small"
              >
                Exporter
              </Button>
              <Button
                variant='contained'
                color='primary'
                startIcon={<AddIcon />}
                onClick={() => router.push('/users/create')}
                size="small"
              >
                Ajouter un utilisateur
              </Button>
            </Box>
          </Box>

          {/* Filtres */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder='Rechercher un utilisateur...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Type de profil</InputLabel>
                <Select
                  value={profileTypeFilter}
                  onChange={e => setProfileTypeFilter(e.target.value)}
                  label="Type de profil"
                >
                  <MenuItem value=''>Tous les types</MenuItem>
                  {profileTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)} 
                  label="Statut"
                >
                  <MenuItem value=''>Tous les statuts</MenuItem>
                  {statuses.map(status => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Tableau */}
          <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Photo</StyledTableCell>
                  <StyledTableCell>Nom</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Type de profil</StyledTableCell>
                  <StyledTableCell>Statut</StyledTableCell>
                  <StyledTableCell>Téléphone</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                  .map(user => (
                    <StyledTableRow
                      key={user.id}
                      sx={{
                        ...(user.fields.Status === 'Deactivated' && {
                          backgroundColor: alpha('#ff9800', 0.04),
                          '&:hover': { backgroundColor: alpha('#ff9800', 0.08) }
                        })
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {user.fields.Photo && user.fields.Photo[0]?.url ? (
                            <Avatar src={user.fields.Photo[0].url} alt="photo" />
                          ) : (
                            <Avatar>
                              {user.fields.FirstName?.[0] || user.fields.LastName?.[0] || <PersonIcon />}
                            </Avatar>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                          {user.fields.FirstName} {user.fields.LastName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant='body2' 
                          color="text.secondary"
                          sx={{ 
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            '&:hover': {
                              color: 'primary.main'
                            }
                          }}
                          onClick={() => router.push(`/users/view/${user.id}`)}
                        >
                          {user.fields.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.fields.profileType[0]}
                          color={profileTypeColors[user.fields.profileType[0]] || "default"}
                          variant="filled"
                          size='small'
                          sx={{ fontWeight: 400, textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.fields.Status || 'N/A'}
                          color={user.fields.Status === 'Activated' ? 'success' : user.fields.Status === 'Deactivated' ? 'error' : 'default'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color="text.secondary">
                          {user.fields.Phone || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          {isSuperAdmin ? (
                            <>
                              <IconButton
                                size='small'
                                onClick={() => router.push(`/users/view/${user.id}`)}
                                disabled={!!deletingUserId || !!lockingUserId}
                              >
                                <VisibilityIcon style={{ fontSize: 18 }} />
                              </IconButton>
                              <IconButton
                                size='small'
                                onClick={() => handleDelete(user.id)}
                                disabled={!!deletingUserId || !!lockingUserId || deletingUserId === user.id}
                              >
                                {deletingUserId === user.id ? <CircularProgress size={20} /> : <DeleteIcon style={{ fontSize: 18 }} />}
                              </IconButton>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {lockingUserId === user.id ? (
                                  <CircularProgress size={20} sx={{ color: 'primary.main' }} />
                                ) : (
                                  <Switch
                                    checked={user.fields.Status === 'Activated'}
                                    onChange={() => handleLockUser(user.id, user.fields.Status || '')}
                                    color="primary"
                                    size="small"
                                    sx={{
                                      '& .MuiSwitch-switchBase': {
                                        '&.Mui-checked': {
                                          color: '#4caf50',
                                          '& + .MuiSwitch-track': {
                                            backgroundColor: '#4caf50',
                                          },
                                        },
                                      },
                                      '& .MuiSwitch-track': {
                                        backgroundColor: '#ff9800',
                                      },
                                    }}
                                  />
                                )}
                              </Box>
                            </>
                          ) : (
                            <IconButton
                              size='small'
                              onClick={() => router.push(`/users/view/${user.id}`)}
                              disabled={!!deletingUserId || !!lockingUserId}
                            >
                              <VisibilityIcon style={{ fontSize: 18 }} />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 15, 25, 50]}
            component='div'
            count={filteredUsers.length}
            rowsPerPage={itemsPerPage}
            page={page - 1}
            onPageChange={(e, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(e) => {
              // Note: itemsPerPage est fixe dans ce composant, mais on peut l'adapter si nécessaire
            }}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            sx={{ mt: 2 }}
          />
        </CardContent>
      </StyledCard>
    </Box>
  )
}

export default UsersManagementPage
