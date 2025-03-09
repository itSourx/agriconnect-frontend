// pages/users/manage.tsx
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
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
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
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
            Authorization: `Bearer ${token}`
          }
        })
        setUsers(response.data)
        console.log(users)
      } catch (err) {
        setError('Erreur lors de la récupération des utilisateurs')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [router, session, status])

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
            Authorization: `Bearer ${token}`
          }
        })
        setUsers(users.filter(user => user.id !== userId))
      } catch (err) {
        setError('Erreur lors de la suppression de l’utilisateur')
        console.error(err)
      }
    }
  }

  // Rediriger vers une page d'édition (à créer séparément si besoin)
  const handleEdit = (userId: string) => {
    router.push(`/users/edit/${userId}`)
  }

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
          <Typography variant='h5' gutterBottom>
            Gestion des utilisateurs
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Type de profil</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell>Produits</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.fields.FirstName} {user.fields.LastName}
                    </TableCell>
                    <TableCell>{user.fields.email}</TableCell>
                    <TableCell>{/* {user.fields.profileType.join(', ')  || 'N/A'} */}</TableCell>
                    <TableCell>{user.fields.Status || 'N/A'}</TableCell>
                    <TableCell>{user.fields.Phone || 'N/A'}</TableCell>
                    <TableCell>{user.fields.ProductsName?.join(', ') || 'Aucun produit'}</TableCell>
                    <TableCell>
                      <Button variant='outlined' color='primary' onClick={() => handleEdit(user.id)} sx={{ mr: 1 }}>
                        Modifier
                      </Button>
                      <Button variant='outlined' color='error' onClick={() => handleDelete(user.id)}>
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default UsersManagementPage
