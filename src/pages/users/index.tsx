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
        setAllUsers(response.data)
        setFilteredUsers(response.data) // Initialise la liste filtrée
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

  // Supprimer un utilisateur
  const handleDelete = async (userId: string) => {
    const token = session?.accessToken
    if (!token) {
      setError('Veuillez vous connecter pour supprimer un utilisateur.')
      return
    }

    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      try {
        await api.delete(`https://agriconnect-bc17856a61b8.herokuapp.com/users/${userId}`, {
          headers: {
            Authorization: `bearer ${token}`
          }
        })
        setAllUsers(allUsers.filter(user => user.id !== userId))
        setFilteredUsers(filteredUsers.filter(user => user.id !== userId))
      } catch (err) {
        setError('Erreur lors de la suppression de l’utilisateur')
        console.error('Erreur suppression:', err)
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

  if (loading) {
    return <Box sx={{ p: 4 }}>Chargement...</Box>
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
                {filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage).map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.fields.Photo && user.fields.Photo.length > 0 ? (
                        <img
                          src={user.fields.Photo[0].url}
                          alt={`${user.fields.FirstName} ${user.fields.LastName}`}
                          style={{ width: 50, height: 50, borderRadius: '50%' }}
                        />
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {user.fields.FirstName} {user.fields.LastName}
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${user.fields.email}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
                        {user.fields.email}
                      </a>
                    </TableCell>
                    <TableCell>{user.fields.profileType.join(', ') || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.fields.Status || 'N/A'}
                        color={user.fields.Status === 'Activated' ? 'success' : 'default'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{user.fields.Phone || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton color='primary' onClick={() => handleEdit(user.id)}>
                        <EditBoxLineIcon style={{ fontSize: 24 }} /> {/* Remplacé EditIcon */}
                      </IconButton>
                      <IconButton color='error' onClick={() => handleDelete(user.id)}>
                        <DeleteIcon />
                      </IconButton>
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
