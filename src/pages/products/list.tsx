import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
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
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useRouter } from 'next/navigation'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    fontWeight: 'bold'
  }
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover
  },
  '&:last-child td, &:last-child th': {
    border: 0
  }
}))

const SalesOverview = () => {
  const [products, setProducts] = useState([])
  const [columns, setColumns] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('https://agriconnect-bc17856a61b8.herokuapp.com/products')
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setProducts(data)
        if (data.length > 0) {
          const dynamicColumns = Object.keys(data[0].fields).map(key => ({
            id: key,
            label: key.charAt(0).toUpperCase() + key.slice(1)
          }))
          setColumns(dynamicColumns)
        }
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des produits:', error)
      })
  }, [])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

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
        } else {
          console.error('Erreur lors de la suppression du produit')
        }
      })
      .catch(error => {
        console.error('Erreur lors de la suppression du produit:', error)
      })
  }

  const handleEdit = id => {
    // Redirige vers une page d'édition de produit
    router.push(`/edit-product/${id}`)
  }

  const salesData = [
    {
      title: 'In-Store Sales',
      amount: '$5,345',
      orders: '5k orders',
      percentage: '5.7%',
      icon: 'ri-home-6-line',
      color: 'success'
    },
    {
      title: 'Website Sales',
      amount: '$74,347',
      orders: '21k orders',
      percentage: '12.4%',
      icon: 'ri-computer-line',
      color: 'success'
    },
    { title: 'Discount', amount: '$14,235', orders: '6k orders', icon: 'ri-gift-line' },
    {
      title: 'Affiliate',
      amount: '$8,345',
      orders: '150 orders',
      percentage: '-3.5%',
      icon: 'ri-money-dollar-circle-line',
      color: 'error'
    }
  ]

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={6}>
                {salesData.map((sale, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant='body1'>{sale.title}</Typography>
                          <Typography variant='h4'>{sale.amount}</Typography>
                        </Box>
                        <Avatar
                          variant='rounded'
                          sx={{ bgcolor: 'action.disabledBackground', color: 'text.primary' }}
                          skin='filled'
                          size={44}
                        >
                          <i className={`${sale.icon} text-[28px]`}></i>
                        </Avatar>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant='body1'>{sale.orders}</Typography>
                        {sale.percentage && (
                          <Chip label={sale.percentage} color={sale.color} size='small' variant='tonal' />
                        )}
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
            <CardHeader title='Filters' />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='status-select'>Status</InputLabel>
                    <Select
                      labelId='status-select'
                      id='select-status'
                      input={<OutlinedInput label='Status' />}
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                    >
                      <MenuItem value=''>Select Status</MenuItem>
                      <MenuItem value='active'>Active</MenuItem>
                      <MenuItem value='inactive'>Inactive</MenuItem>
                      <MenuItem value='scheduled'>Scheduled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='category-select'>Category</InputLabel>
                    <Select
                      labelId='category-select'
                      id='select-category'
                      input={<OutlinedInput label='Category' />}
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    >
                      <MenuItem value=''>Select Category</MenuItem>
                      <MenuItem value='electronics'>Electronics</MenuItem>
                      <MenuItem value='accessories'>Accessories</MenuItem>
                      <MenuItem value='shoes'>Shoes</MenuItem>
                      <MenuItem value='office'>Office</MenuItem>
                      <MenuItem value='home decor'>Home Decor</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='stock-select'>Stock</InputLabel>
                    <Select
                      labelId='stock-select'
                      id='select-stock'
                      input={<OutlinedInput label='Stock' />}
                      value={stock}
                      onChange={e => setStock(e.target.value)}
                    >
                      <MenuItem value=''>Select Stock</MenuItem>
                      <MenuItem value='in stock'>In Stock</MenuItem>
                      <MenuItem value='out of stock'>Out of Stock</MenuItem>
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
                  placeholder='Search Product'
                  variant='outlined'
                  size='small'
                  sx={{ maxWidth: { sm: '300px' }, width: '100%' }}
                />

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
                  <Button
                    variant='outlined'
                    color='secondary'
                    startIcon={<i className='ri-upload-2-line'></i>}
                    fullWidth={true}
                    sx={{ flexGrow: 1 }}
                  >
                    Export
                  </Button>
                  <Button
                    variant='contained'
                    color='primary'
                    startIcon={<i className='ri-add-line'></i>}
                    href='/materio-mui-nextjs-admin-template/demo-1/en/apps/ecommerce/products/add'
                    fullWidth={true}
                    sx={{ flexGrow: 1 }}
                  >
                    Add Product
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
                      <StyledTableCell>Product</StyledTableCell>
                      <StyledTableCell>Description</StyledTableCell>
                      <StyledTableCell>Quantity</StyledTableCell>
                      <StyledTableCell>Price</StyledTableCell>
                      <StyledTableCell>Category</StyledTableCell>
                      <StyledTableCell>Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                      <StyledTableRow key={row.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {row.fields.Photo && row.fields.Photo.length > 0 && (
                              <img
                                width='38'
                                height='38'
                                className='rounded bg-actionHover'
                                src={row.fields.Photo[0].url}
                                alt={row.fields.Name}
                              />
                            )}
                            <Box>
                              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                                {row.fields.Name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{row.fields.Description}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body1'>{row.fields.quantity}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body1'>{row.fields.price}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body1'>{row.fields.category}</Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant='outlined'
                            size='small'
                            onClick={() => handleEdit(row.id)}
                            startIcon={<i className='ri-edit-box-line text-[22px] text-textSecondary'></i>}
                            sx={{ marginRight: 1 }} // Ajoute une marge à droite pour espacer les boutons
                          >
                            Edit
                          </Button>
                          <Button
                            variant='contained'
                            size='small'
                            color='error'
                            onClick={() => handleDelete(row.id)}
                            startIcon={<i className='ri-delete-bin-line text-[22px] text-textSecondary'></i>}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component='div'
                count={products.length}
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

export default SalesOverview
