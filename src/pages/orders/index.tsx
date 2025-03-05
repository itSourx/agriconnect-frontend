import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
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
import Chip from '@mui/material/Chip'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useRouter } from 'next/navigation'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': { fontWeight: 'bold' }
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
  '&:last-child td, &:last-child th': { border: 0 }
}))

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [farmerFilter, setFarmerFilter] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const router = useRouter()

  // Traduction et couleurs des statuts
  const statusTranslations = {
    Pending: { label: 'En attente', color: 'warning' },
    Confirmed: { label: 'Confirmée', color: 'success' },
    Delivered: { label: 'Livrée', color: 'info' }
  }

  // Charger et trier les commandes
  useEffect(() => {
    fetch('https://agriconnect-bc17856a61b8.herokuapp.com/orders', {
      headers: { accept: '*/*' }
    })
      .then(response => response.json())
      .then(data => {
        // Trier par date (du plus récent au plus ancien)
        const sortedOrders = data.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
        setOrders(sortedOrders)
        setFilteredOrders(sortedOrders)
      })
      .catch(error => console.error('Erreur lors de la récupération des commandes:', error))
  }, [])

  // Filtrer les commandes
  useEffect(() => {
    let filtered = [...orders]

    if (farmerFilter) {
      filtered = filtered.filter(order => order.fields.farmerId?.[0] === farmerFilter)
    }
    if (productFilter) {
      filtered = filtered.filter(order => order.fields.productName?.[0] === productFilter)
    }
    if (statusFilter) {
      filtered = filtered.filter(order => order.fields.Status === statusFilter)
    }
    if (searchQuery) {
      filtered = filtered.filter(
        order =>
          order.fields.farmerFirstName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.farmerLastName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.buyerFirstName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.buyerLastName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.productName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredOrders(filtered)
    setPage(0)
  }, [farmerFilter, productFilter, statusFilter, searchQuery, orders])

  const handleChangePage = (event, newPage) => setPage(newPage)

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDelete = id => {
    fetch(`https://agriconnect-bc17856a61b8.herokuapp.com/orders/${id}`, {
      method: 'DELETE',
      headers: { accept: '*/*' }
    })
      .then(response => {
        if (response.ok) {
          setOrders(orders.filter(order => order.id !== id))
          setFilteredOrders(filteredOrders.filter(order => order.id !== id))
        } else {
          console.error('Erreur lors de la suppression de la commande')
        }
      })
      .catch(error => console.error('Erreur lors de la suppression de la commande:', error))
  }

  const handleViewDetails = order => {
    setSelectedOrder(order)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedOrder(null)
  }

  // Options uniques pour les filtres
  const farmers = Array.from(
    new Map(
      orders.map(o => [
        o.fields.farmerId?.[0],
        {
          id: o.fields.farmerId?.[0],
          firstName: o.fields.farmerFirstName?.[0],
          lastName: o.fields.farmerLastName?.[0]
        }
      ])
    ).values()
  ).filter(f => f.id)

  const products = [...new Set(orders.map(o => o.fields.productName?.[0]).filter(Boolean))]
  const statuses = ['Pending', 'Confirmed', 'Delivered'] // Statuts fixes

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title='Liste des commandes'
              action={
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<i className='ri-add-line'></i>}
                  href='/orders/add'
                >
                  Nouvelle commande
                </Button>
              }
            />
            <CardContent>
              <Grid container spacing={6}>
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
                    </Select>{' '}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='product-select'>Produit</InputLabel>
                    <Select
                      labelId='product-select'
                      value={productFilter}
                      onChange={e => setProductFilter(e.target.value)}
                      input={<OutlinedInput label='Produit' />}
                    >
                      <MenuItem value=''>Tous</MenuItem>
                      {products.map(product => (
                        <MenuItem key={product} value={product}>
                          {product}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='status-select'>Statut</InputLabel>
                    <Select
                      labelId='status-select'
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      input={<OutlinedInput label='Statut' />}
                    >
                      <MenuItem value=''>Tous</MenuItem>
                      {statuses.map(status => (
                        <MenuItem key={status} value={status}>
                          {statusTranslations[status].label}
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
                  placeholder='Rechercher (agriculteur, acheteur, produit)'
                  variant='outlined'
                  size='small'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  sx={{ maxWidth: { sm: '300px' }, width: '100%' }}
                />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
                  <Button
                    variant='contained'
                    color='primary'
                    startIcon={<i className='ri-add-line'></i>}
                    href='/orders/add'
                    fullWidth={true}
                    sx={{ flexGrow: 1 }}
                  >
                    Ajouter
                  </Button>
                </Box>
              </Box>

              <TableContainer sx={{ overflowX: 'auto', mt: 2 }}>
                <Table aria-label='orders table'>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>
                        <Checkbox />
                      </StyledTableCell>
                      <StyledTableCell>Agriculteur</StyledTableCell>
                      <StyledTableCell>Acheteur</StyledTableCell>
                      <StyledTableCell>Produit</StyledTableCell>
                      <StyledTableCell>Quantité</StyledTableCell>
                      <StyledTableCell>Prix total (F CFA)</StyledTableCell>
                      <StyledTableCell>Statut</StyledTableCell>
                      <StyledTableCell>Date</StyledTableCell>
                      <StyledTableCell>Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(order => (
                      <StyledTableRow key={order.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          {order.fields.farmerFirstName?.[0]} {order.fields.farmerLastName?.[0]}
                        </TableCell>
                        <TableCell>
                          {order.fields.buyerFirstName?.[0]} {order.fields.buyerLastName?.[0]}
                        </TableCell>
                        <TableCell>{order.fields.productName?.[0]}</TableCell>
                        <TableCell>{order.fields.Qty}</TableCell>
                        <TableCell>{order.fields.totalPrice?.toLocaleString('fr-FR')}</TableCell>
                        <TableCell>
                          <Chip
                            label={statusTranslations[order.fields.Status]?.label || order.fields.Status}
                            color={statusTranslations[order.fields.Status]?.color || 'default'}
                            size='small'
                            variant='tonal'
                          />
                        </TableCell>
                        <TableCell>{new Date(order.createdTime).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant='outlined'
                            size='small'
                            onClick={() => handleViewDetails(order)}
                            startIcon={<i className='ri-eye-line text-[22px] text-textSecondary'></i>}
                            sx={{ marginRight: 1 }}
                          >
                            Détails
                          </Button>
                          <Button
                            variant='contained'
                            size='small'
                            color='error'
                            onClick={() => handleDelete(order.id)}
                            startIcon={<i className='ri-delete-bin-line text-[22px] text-textSecondary'></i>}
                          >
                            Supprimer
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
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog pour les détails de la commande */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='md' fullWidth>
        <DialogTitle>Détails de la commande</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography>
                <strong>Agriculteur :</strong> {selectedOrder.fields.farmerFirstName?.[0]}{' '}
                {selectedOrder.fields.farmerLastName?.[0]}
              </Typography>
              <Typography>
                <strong>Email agriculteur :</strong> {selectedOrder.fields.farmerEmail?.[0]}
              </Typography>
              <Typography>
                <strong>Acheteur :</strong> {selectedOrder.fields.buyerFirstName?.[0]}{' '}
                {selectedOrder.fields.buyerLastName?.[0]}
              </Typography>
              <Typography>
                <strong>Email acheteur :</strong> {selectedOrder.fields.buyerEmail?.[0]}
              </Typography>
              <Typography>
                <strong>Téléphone acheteur :</strong> {selectedOrder.fields.buyerPhone?.[0]}
              </Typography>
              <Typography>
                <strong>Adresse acheteur :</strong> {selectedOrder.fields.buyerAddress?.[0]}
              </Typography>
              <Typography>
                <strong>Produit :</strong> {selectedOrder.fields.productName?.[0]}
              </Typography>
              <Typography>
                <strong>Quantité :</strong> {selectedOrder.fields.Qty}
              </Typography>
              <Typography>
                <strong>Prix total :</strong> {selectedOrder.fields.totalPrice?.toLocaleString('fr-FR')} F CFA
              </Typography>
              <Typography>
                <strong>Statut :</strong>{' '}
                {statusTranslations[selectedOrder.fields.Status]?.label || selectedOrder.fields.Status}
              </Typography>
              <Typography>
                <strong>Date de création :</strong> {new Date(selectedOrder.createdTime).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='primary'>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default OrdersPage
