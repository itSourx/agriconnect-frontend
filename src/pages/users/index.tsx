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
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import DeleteIcon from '@mui/icons-material/Delete'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Pagination from '@mui/material/Pagination'
import Button from '@mui/material/Button'
import EditBoxLineIcon from 'remixicon-react/EditBoxLineIcon'
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
import { alpha } from '@mui/material/styles'

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
        setFilteredUsers(response.data as User[]) // Initialise la liste filtrée
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

  // Rediriger vers une page d'édition (à créer séparément si besoin)
  const handleEdit = (userId: string) => {
    router.push(`/users/edit/${userId}`)
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
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='h5'>Gestion des utilisateurs</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant='contained' onClick={() => router.push('/users/create')}>
                Ajouter un utilisateur
              </Button>
              <Button variant='contained' onClick={handleExport}>
                Exporter
              </Button>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label='Rechercher un utilisateur'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Type de profil</InputLabel>
              <Select
                value={profileTypeFilter}
                onChange={e => setProfileTypeFilter(e.target.value)}
                label='Type de profil'
              >
                <MenuItem value=''>Tous</MenuItem>
                {profileTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Statut</InputLabel>
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label='Statut'>
                <MenuItem value=''>Tous</MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Photo</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Type de profil</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                  .map(user => (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{
                        '&:last-of-type td, &:last-of-type th': { border: 0 },
                        transition: 'background 0.2s',
                        '&:hover': { backgroundColor: 'rgba(0, 123, 255, 0.04)' },
                        ...(user.fields.Status === 'Desactivated' && {
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
                        <Typography fontWeight={500}>
                          {user.fields.FirstName} {user.fields.LastName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <a href={`mailto:${user.fields.email}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
                          {user.fields.email}
                        </a>
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
                          color={user.fields.Status === 'Activated' ? 'success' : 'default'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>{user.fields.Phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isSuperAdmin ? (
                            <>
                              <IconButton
                                size='small'
                                onClick={() => handleEdit(user.id)}
                                disabled={!!deletingUserId || !!lockingUserId}
                                sx={{ color: 'primary.main' }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size='small'
                                onClick={() => handleDelete(user.id)}
                                disabled={!!deletingUserId || !!lockingUserId || deletingUserId === user.id}
                                sx={{ color: 'error.main' }}
                              >
                                {deletingUserId === user.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                              </IconButton>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {lockingUserId === user.id ? (
                                  <CircularProgress size={20} sx={{ color: 'primary.main' }} />
                                ) : (
                                  <Switch
                                    checked={user.fields.Status === 'Activated'}
                                    onChange={() => handleLockUser(user.id, user.fields.Status || '')}
                                    color="primary"
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
                              onClick={() => handleEdit(user.id)}
                              disabled={!!deletingUserId || !!lockingUserId}
                              sx={{ color: 'primary.main' }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={Math.ceil(filteredUsers.length / itemsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color='primary'
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default UsersManagementPage
