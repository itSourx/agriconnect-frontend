// pages/products-products.tsx
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'
import DeleteIcon from 'mdi-material-ui/Delete'
import EditIcon from 'mdi-material-ui/Pencil'
import api from 'src/api/axiosConfig'

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  margin: '0 auto',
  marginTop: theme.spacing(4)
}))

interface Product {
  id: string
  Name: string
  description: string
  price: number
  quantity: number
  category: string
  mesure: string
  Photo: string
  OrdersCount: number
}

const MarketplaceProducts = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    Name: '',
    description: '',
    price: '',
    quantity: '',
    category: 'Legumes & Fruits',
    mesure: 'Kilo',
    photoUrl: ''
  })
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const maxDescriptionLength = 200

  const mesures = ['Tas', 'Kg', 'Unité', 'Litre']

  useEffect(() => {
    if (status === 'loading') return // Attend que la session soit chargée
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchProducts = async () => {
      const userId = session?.user?.id

      if (!userId) {
        router.push('/auth/login')
        return
      }

      try {
        setIsLoading(true)
        const response = await api.get(`https://agriconnect-bc17856a61b8.herokuapp.com/users/${userId}`, {
          headers: { Accept: '*/*' }
        })

        const productIds = response.data.fields.Products || []
        const productsData = await Promise.all(
          productIds.map(async (productId: string) => {
            const productResponse = await api.get(
              `https://agriconnect-bc17856a61b8.herokuapp.com/products/${productId}`,
              { headers: { Accept: '*/*' } }
            )
            const fields = productResponse.data.fields
            return {
              id: productResponse.data.id,
              Name: fields.Name,
              description: fields.description,
              price: fields.price,
              quantity: fields.quantity,
              category: fields.category,
              mesure: fields.mesure,
              Photo: fields.Photo?.[0]?.url || '',
              OrdersCount: fields.Orders?.length || 0
            }
          })
        )
        setProducts(productsData)
      } catch (err) {
        setError('Erreur lors de la récupération des produits')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [router, session, status])

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (field === 'description' && value.length > maxDescriptionLength) return
    setNewProduct({ ...newProduct, [field]: value })
  }

  const handleEditInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingProduct) {
      const value = e.target.value
      if (field === 'description' && value.length > maxDescriptionLength) return
      setEditingProduct({ ...editingProduct, [field]: value })
    }
  }

  const addProduct = async () => {
    try {
      const token = session?.accessToken // Récupère le token depuis la session
      const userId = session?.user?.id // Récupère l'ID depuis la session
      const productData = {
        fields: {
          Name: newProduct.Name,
          description: newProduct.description,
          quantity: Number(newProduct.quantity),
          price: Number(newProduct.price),
          category: newProduct.category,
          mesure: newProduct.mesure,
          user: [userId],
          Photo: newProduct.photoUrl ? [{ url: newProduct.photoUrl }] : []
        }
      }

      const response = await api.post('https://agriconnect-bc17856a61b8.herokuapp.com/products', productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const newProd = {
        id: response.data.id,
        Name: newProduct.Name,
        description: newProduct.description,
        price: Number(newProduct.price),
        quantity: Number(newProduct.quantity),
        category: newProduct.category,
        mesure: newProduct.mesure,
        Photo: newProduct.photoUrl,
        OrdersCount: 0
      }
      setProducts([...products, newProd])
      setNewProduct({
        Name: '',
        description: '',
        price: '',
        quantity: '',
        category: 'Legumes & Fruits',
        mesure: 'Kilo',
        photoUrl: ''
      })
      setShowForm(false)
      setError(null)
    } catch (err) {
      setError("Erreur lors de l'ajout du produit")
      console.error(err)
    }
  }

  const updateProduct = async () => {
    if (!editingProduct) return

    try {
      const token = session?.accessToken
      const updateData = {
        fields: {
          Name: editingProduct.Name,
          description: editingProduct.description,
          price: editingProduct.price,
          quantity: editingProduct.quantity,
          category: editingProduct.category,
          mesure: editingProduct.mesure
        }
      }

      await api.put(`https://agriconnect-bc17856a61b8.herokuapp.com/products/${editingProduct.id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      setProducts(products.map(p => (p.id === editingProduct.id ? editingProduct : p)))
      setEditingProduct(null)
      setError(null)
    } catch (err) {
      setError('Erreur lors de la mise à jour du produit')
      console.error(err)
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const token = session?.accessToken
      await api.delete(`https://agriconnect-bc17856a61b8.herokuapp.com/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setProducts(products.filter(p => p.id !== id))
      setError(null)
    } catch (err) {
      setError('Erreur lors de la suppression du produit')
      console.error(err)
    }
  }

  if (status === 'loading' || isLoading) {
    return <Box sx={{ p: 4 }}>Chargement...</Box>
  }

  return (
    <Box sx={{ padding: 4 }}>
      <StyledCard>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant='h5'>Gestion des Produits</Typography>
            {!showForm && (
              <Button variant='contained' onClick={() => setShowForm(true)}>
                Ajouter un produit
              </Button>
            )}
          </Box>

          {error && (
            <Typography color='error' sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* Formulaire d'ajout */}
          {showForm && (
            <Card sx={{ mb: 4 }}>
              <CardHeader title={<Typography variant='h6'>Ajouter un nouveau produit</Typography>} />
              <CardContent>
                <Grid container spacing={5}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Nom du produit'
                      value={newProduct.Name}
                      onChange={handleInputChange('Name')}
                      placeholder='ex. Betteraves'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Description'
                      value={newProduct.description}
                      onChange={handleInputChange('description')}
                      placeholder='ex. Betteraves cultivées artisanalement'
                      multiline
                      rows={4}
                      helperText={`${newProduct.description.length}/${maxDescriptionLength} caractères`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Quantité'
                      type='number'
                      value={newProduct.quantity}
                      onChange={handleInputChange('quantity')}
                      placeholder='ex. 56'
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Prix'
                      type='number'
                      value={newProduct.price}
                      onChange={handleInputChange('price')}
                      placeholder='ex. 300'
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Catégorie</InputLabel>
                      <Select value={newProduct.category} onChange={handleInputChange('category')} label='Catégorie'>
                        <MenuItem value='Legumes & Fruits'>Légumes & Fruits</MenuItem>
                        {/* Ajouter d'autres catégories si nécessaire */}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Mesure</InputLabel>
                      <Select value={newProduct.mesure} onChange={handleInputChange('mesure')} label='Mesure'>
                        {mesures.map(mes => (
                          <MenuItem key={mes} value={mes}>
                            {mes}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="URL de l'image"
                      value={newProduct.photoUrl}
                      onChange={handleInputChange('photoUrl')}
                      placeholder='ex. https://example.com/betteraves.jpg'
                      helperText="Collez l'URL de l'image du produit"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button variant='outlined' onClick={() => setShowForm(false)}>
                        Annuler
                      </Button>
                      <Button variant='contained' onClick={addProduct}>
                        Ajouter le produit
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Liste des produits */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Prix</TableCell>
                  <TableCell>Quantité</TableCell>
                  <TableCell>Commandes</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map(product => (
                  <TableRow key={product.id}>
                    {editingProduct?.id === product.id ? (
                      <>
                        <TableCell>
                          <TextField value={editingProduct.Name} onChange={handleEditInputChange('Name')} />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={editingProduct.description || ''}
                            onChange={handleEditInputChange('description')}
                            multiline
                            rows={2}
                            sx={{ minWidth: 300 }}
                            helperText={`${(editingProduct.description || '').length}/${maxDescriptionLength}`}
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            type='number'
                            value={editingProduct.price}
                            onChange={handleEditInputChange('price')}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type='number'
                            value={editingProduct.quantity}
                            onChange={handleEditInputChange('quantity')}
                          />
                        </TableCell>
                        <TableCell>{product.OrdersCount}</TableCell>
                        <TableCell>
                          <Button onClick={updateProduct}>Sauvegarder</Button>
                          <Button onClick={() => setEditingProduct(null)}>Annuler</Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{product.Name}</TableCell>
                        <TableCell>{product.description}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>{product.OrdersCount}</TableCell>
                        <TableCell>
                          <IconButton color='primary' onClick={() => setEditingProduct(product)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color='error' onClick={() => deleteProduct(product.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </StyledCard>
    </Box>
  )
}

export default MarketplaceProducts
