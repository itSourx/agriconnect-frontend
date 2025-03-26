// pages/products-products.tsx
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  Tooltip
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, ImageNotSupported as ImageNotSupportedIcon } from '@mui/icons-material'
import { api } from 'src/configs/api'

interface Product {
  id: string
  fields: {
    Name: string
    description?: string
    price: number
    quantity: number
    category: string
    mesure: string
    Photo?: Array<{
      url: string
      filename: string
    }>
    location?: string
    CreatedDate: string
    LastModifiedDate: string
    user?: string[]
  }
}

const MyProducts = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    fetchProducts()
  }, [session])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get<Product[]>('/products')
      const userProducts = response.data.filter(
        product => product.fields.user?.[0] === session?.user?.id
      )
      setProducts(userProducts)
    } catch (err) {
      setError('Erreur lors du chargement des produits')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    router.push(`/products/edit/${product.id}`)
  }

  const handleDelete = async (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await api.delete(`/products/${productId}`)
        setProducts(products.filter(product => product.id !== productId))
      } catch (err) {
        console.error('Error deleting product:', err)
        alert('Erreur lors de la suppression du produit')
      }
    }
  }

  const handleAddProduct = () => {
    router.push('/products/add')
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const filteredProducts = products.filter(product =>
    product.fields.Name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Mes Produits</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
        >
          Ajouter un produit
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Rechercher un produit..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Localisation</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.fields.Photo && product.fields.Photo[0] ? (
                      <img
                        src={product.fields.Photo[0].url}
                        alt={product.fields.Name}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    ) : (
                      <Box display="flex" alignItems="center" color="text.secondary">
                        <ImageNotSupportedIcon />
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{product.fields.Name}</TableCell>
                  <TableCell>
                    <Tooltip title={product.fields.description || 'Aucune description'}>
                      <Typography noWrap>
                        {product.fields.description || 'Aucune description'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{product.fields.price} FCFA</TableCell>
                  <TableCell>
                    {product.fields.quantity} {product.fields.mesure}
                  </TableCell>
                  <TableCell>
                    <Chip label={product.fields.category} size="small" />
                  </TableCell>
                  <TableCell>{product.fields.location || 'Non spécifié'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(product)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(product.id)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredProducts.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page"
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Box>
  )
}

export default MyProducts
