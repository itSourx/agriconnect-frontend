import React, { useEffect, useState, useCallback } from 'react' // Ajouté useCallback
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import OutlinedInput from '@mui/material/OutlinedInput'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import EditBoxLineIcon from 'remixicon-react/EditBoxLineIcon'
import DeleteBinLineIcon from 'remixicon-react/DeleteBinLineIcon'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': { fontWeight: 'bold' }
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
  '&:last-child td, &:last-child th': { border: 0 }
}))

const Products = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [mesureFilter, setMesureFilter] = useState('')
  const [farmerFilter, setFarmerFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { data: session, status } = useSession()

  // Charger les produits
  useEffect(() => {

    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchProducts = async () => {
      const userRole = session?.user?.profileType
      console.log(session?.user?.profileType)
      const userId = session?.user?.id
      const token = session?.accessToken

      try {
        if (userRole === 'AGRICULTEUR') {
          const userResponse = await fetch(`https://agriconnect-bc17856a61b8.herokuapp.com/users/${userId}`, {
            headers: { Authorization: `bearer ${token}`, Accept: '*/*' }
          })
          const userData = await userResponse.json()
          const productIds = userData.fields.Products || []

          const productsData = await Promise.all(
            productIds.map(async (productId) => {
              const productResponse = await fetch(
                `https://agriconnect-bc17856a61b8.herokuapp.com/products/${productId}`,
                { headers: { Authorization: `bearer ${token}`, Accept: '*/*' } }
              )
              return productResponse.json()
            })
          )
          setProducts(productsData)
          setFilteredProducts(productsData)
        } else {
          const response = await fetch('https://agriconnect-bc17856a61b8.herokuapp.com/products', {
            headers: { Authorization: `bearer ${token}` }
          })
          const data = await response.json()
          setProducts(data)
          setFilteredProducts(data)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error)
      }
    }

    fetchProducts()
  }, [session, status, router])

  // Filtrer les produits
  useEffect(() => {
    let filtered = products

    if (categoryFilter) {
      filtered = filtered.filter(product => product.fields.category === categoryFilter)
    }
    if (mesureFilter) {
      filtered = filtered.filter(product => product.fields.mesure === mesureFilter)
    }
    if (farmerFilter) {
      filtered = filtered.filter(product => product.fields.farmerId?.includes(farmerFilter))
    }
    if (searchQuery) {
      filtered = filtered.filter(product => product.fields.Name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredProducts(filtered)
    setPage(0)
  }, [categoryFilter, mesureFilter, farmerFilter, searchQuery, products])

  // Calculer les statistiques dynamiques
  const getProductStats = useCallback(() => {
    const totalProducts = filteredProducts.length
    const totalValue = filteredProducts
      .reduce((sum, p) => sum + (Number(p.fields.price) || 0) * (Number(p.fields.quantity) || 0), 0)
      .toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const quantitiesByUnit = filteredProducts.reduce((acc, p) => {
      const unit = p.fields.mesure || 'unités'
      acc[unit] = (acc[unit] || 0) + (Number(p.fields.quantity) || 0)
      return acc
    }, {})
    const totalQuantity = Object.entries(quantitiesByUnit)
      .map(([unit, qty]) => `${qty.toLocaleString('fr-FR')} ${unit}`)
      .join(', ')

    const categoryCount = filteredProducts.reduce((acc, p) => {
      acc[p.fields.category] = (acc[p.fields.category] || 0) + 1
      return acc
    }, {})
    const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    return [
      {
        title: 'Produits totaux',
        amount: totalProducts,
        orders: `${totalProducts} articles`,
        icon: 'ri-box-3-line',
        color: 'success'
      },
      {
        title: 'Valeur estimée',
        amount: `${totalValue} F CFA`,
        orders: `${filteredProducts.length} produits`,
        icon: 'ri-money-dollar-circle-line',
        color: 'success'
      },
      {
        title: 'Top catégorie',
        amount: topCategory,
        orders: `${categoryCount[topCategory] || 0} produits`,
        icon: 'ri-folder-line',
        color: 'info'
      },
      {
        title: 'Quantités totales',
        amount: totalQuantity || '0 unités',
        orders: 'disponible',
        icon: 'ri-stack-line',
        color: 'warning'
      }
    ]
  }, [filteredProducts])

  const productStats = getProductStats()

  const handleChangePage = (event, newPage) => setPage(newPage)

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDelete = id => {
    fetch(`https://agriconnect-bc17856a61b8.herokuapp.com/products/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          setProducts(products.filter(product => product.id !== id))
          setFilteredProducts(filteredProducts.filter(product => product.id !== id))
        } else {
          console.error('Erreur lors de la suppression du produit')
        }
      })
      .catch(error => console.error('Erreur lors de la suppression du produit:', error))
  }

  const handleEdit = id => {
    router.push(`/products/edit-product/${id}`)
  }

  const handleExport = () => {
    const exportData = filteredProducts.map(product => ({
      Product: product.fields.Name,
      Description: product.fields.description || '',
      Quantity: product.fields.quantity || '',
      Price: product.fields.price || '',
      Category: product.fields.category || '',
      'Photo URL': product.fields.Photo?.[0]?.url || ''
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')
    XLSX.writeFile(workbook, 'products_export.xlsx')
  }

  const categories = [...new Set(products.map(p => p.fields.category).filter(Boolean))]
  const mesures = [...new Set(products.map(p => p.fields.mesure).filter(Boolean))]
  const farmers = Array.from(
    new Map(
      products.map(p => [
        p.fields.farmerId?.[0],
        {
          id: p.fields.farmerId?.[0],
          firstName: p.fields.userFirstName?.[0],
          lastName: p.fields.userLastName?.[0]
        }
      ])
    ).values()
  ).filter(f => f.id)

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={6}>
                {productStats.map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant='body1'>{stat.title}</Typography>
                          <Typography
                            variant='h4'
                            sx={{
                              fontSize: stat.title === 'Quantités totales' ? '1.1rem' : '2rem'
                            }}
                          >
                            {stat.amount}
                          </Typography>
                        </Box>
                        <Avatar
                          variant='rounded'
                          sx={{ bgcolor: 'action.disabledBackground', color: 'text.primary' }}
                          size={44}
                        >
                          <i className={`${stat.icon} text-[28px]`}></i>
                        </Avatar>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant='body1'>{stat.orders}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title='Filtres' />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='category-select'>Catégorie</InputLabel>
                    <Select
                      labelId='category-select'
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      input={<OutlinedInput label='Catégorie' />}
                    >
                      <MenuItem value=''>Toutes</MenuItem>
                      {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='mesure-select'>Mesure</InputLabel>
                    <Select
                      labelId='mesure-select'
                      value={mesureFilter}
                      onChange={e => setMesureFilter(e.target.value)}
                      input={<OutlinedInput label='Mesure' />}
                    >
                      <MenuItem value=''>Toutes</MenuItem>
                      {mesures.map(mes => (
                        <MenuItem key={mes} value={mes}>
                          {mes}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='farmer-select'>Agriculteur</InputLabel>
                    <Select
                      labelId='farmer-select'
                      value={farmerFilter}
                      onChange={e => setFarmerFilter(e.target.value)}
                      input={<OutlinedInput label='Agriculteur' />}
                    >
                      <MenuItem value=''>Tous</MenuItem>
                      {farmers.map(farmer => (
                        <MenuItem key={farmer.id} value={farmer.id}>
                          {`${farmer.firstName} ${farmer.lastName}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 4,
                  flexWrap: { xs: 'wrap', sm: 'nowrap' }
                }}
              >
                <TextField
                  placeholder='Rechercher un produit'
                  variant='outlined'
                  size='small'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  sx={{ maxWidth: { sm: '300px' }, width: '100%' }}
                />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
                  <Button
                    variant='outlined'
                    color='secondary'
                    startIcon={<i className='ri-upload-2-line'></i>}
                    onClick={handleExport}
                    fullWidth={true}
                    sx={{ flexGrow: 1 }}
                  >
                    Exporter
                  </Button>
                  <Button
                    variant='contained'
                    color='primary'
                    startIcon={<i className='ri-add-line'></i>}
                    href='/products/add'
                    fullWidth={true}
                    sx={{ flexGrow: 1 }}
                  >
                    Ajouter un produit
                  </Button>
                </Box>
              </Box>

              <TableContainer sx={{ overflowX: 'auto', mt: 2 }}>
                <Table aria-label='products table'>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>
                        <Checkbox />
                      </StyledTableCell>
                      <StyledTableCell>Produit</StyledTableCell>
                      <StyledTableCell>Description</StyledTableCell>
                      <StyledTableCell>Quantité</StyledTableCell>
                      <StyledTableCell>Prix</StyledTableCell>
                      <StyledTableCell>Catégorie</StyledTableCell>
                      <StyledTableCell>Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                      <StyledTableRow key={row.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {row.fields.Photo?.length > 0 && (
                              <img
                                width='38'
                                height='38'
                                className='rounded bg-actionHover'
                                src={row.fields.Photo[0].url}
                                alt={row.fields.Name}
                              />
                            )}
                            <Typography variant='body1' sx={{ fontWeight: 500 }}>
                              {row.fields.Name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{row.fields.description}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body1'>
                            {row.fields.quantity} {row.fields.mesure}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body1'>{row.fields.price}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body1'>{row.fields.category}</Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton color='primary' size='small' onClick={() => handleEdit(row.id)}>
                            <EditBoxLineIcon style={{ fontSize: 22, color: 'var(--mui-palette-text-secondary)' }} />
                          </IconButton>
                          <IconButton color='error' size='small' onClick={() => handleDelete(row.id)}>
                            <DeleteBinLineIcon style={{ fontSize: 22, color: 'var(--mui-palette-error-main)' }} />
                          </IconButton>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component='div'
                count={filteredProducts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Products
