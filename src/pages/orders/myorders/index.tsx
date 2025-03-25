import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
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
import VisibilityIcon from '@mui/icons-material/Visibility'
import DownloadIcon from '@mui/icons-material/Download'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import api from 'src/api/axiosConfig'
import { Order, User, Session } from '@/types/order'
import { PDFDownloadLink } from '@react-pdf/renderer'
import FacturePDF from '@/components/FacturePDF'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': { fontWeight: 'bold' }
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
  '&:last-child td, &:last-child th': { border: 0 }
}))

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [productFilter, setProductFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { data: session, status } = useSession()

  const statusTranslations: Record<string, { label: string; color: string }> = {
    pending: { label: 'En attente', color: 'warning' },
    confirmed: { label: 'Confirmée', color: 'success' },
    delivered: { label: 'Livrée', color: 'info' }
  }

  const statusOrder = ['pending', 'confirmed', 'delivered']

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchOrders = async () => {
      const userId = session?.user?.id

      if (!userId) {
        router.push('/auth/login')
        return
      }

      try {
        setIsLoading(true)
        const response = await api.get<Order[]>('https://agriconnect-bc17856a61b8.herokuapp.com/orders', {
          headers: { accept: '*/*' }
        })

        const farmerOrders = response.data
          .filter(order => order.fields.farmerId?.includes(userId))
          .map(order => {
            const farmerProductIndices = order.fields.farmerId
              ?.map((id: string, index: number) => (id === userId ? index : -1))
              .filter((index: number) => index !== -1) || [];

            return {
              ...order,
              fields: {
                ...order.fields,
                products: farmerProductIndices.map(i => order.fields.products?.[i]),
                productName: farmerProductIndices.map(i => order.fields.productName?.[i]),
                farmerId: farmerProductIndices.map(i => order.fields.farmerId?.[i]),
                farmerFirstName: farmerProductIndices.map(i => order.fields.farmerFirstName?.[i]),
                farmerLastName: farmerProductIndices.map(i => order.fields.farmerLastName?.[i])
              }
            }
          })
          .sort((a: Order, b: Order) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())

        setOrders(farmerOrders)
        setFilteredOrders(farmerOrders)
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [router, session, status])

  useEffect(() => {
    let filtered = [...orders]

    if (productFilter) {
      filtered = filtered.filter(order => order.fields.productName?.includes(productFilter))
    }
    if (statusFilter) {
      filtered = filtered.filter(order => order.fields.Status === statusFilter)
    }
    if (searchQuery) {
      filtered = filtered.filter(
        order =>
          order.fields.buyerFirstName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.buyerLastName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.productName?.some((name: string) => name?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredOrders(filtered)
    setPage(0)
  }, [productFilter, statusFilter, searchQuery, orders])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleNextStatus = async (orderId: string, currentStatus: string) => {
    const currentIndex = statusOrder.indexOf(currentStatus)
    if (currentIndex === -1 || currentIndex === statusOrder.length - 1) return

    const nextStatus = statusOrder[currentIndex + 1] as 'pending' | 'confirmed' | 'delivered'
    const token = (session as Session)?.accessToken

    try {
      await api.put(
        `https://agriconnect-bc17856a61b8.herokuapp.com/orders/${orderId}`,
        { fields: { Status: nextStatus } },
        {
          headers: {
            Authorization: `bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      setOrders(
        orders.map(order =>
          order.id === orderId ? { ...order, fields: { ...order.fields, Status: nextStatus } } : order
        )
      )
      setFilteredOrders(
        filteredOrders.map(order =>
          order.id === orderId ? { ...order, fields: { ...order.fields, Status: nextStatus } } : order
        )
      )
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  const handleViewDetails = (id: string) => {
    router.push(`/orders/myordersdetails/${id}`)
  }

  const products = [...new Set(orders.flatMap(o => o.fields.productName || []).filter(Boolean))]
  const statuses = ['pending', 'confirmed', 'delivered']

  if (status === 'loading' || isLoading) {
    return <Box sx={{ p: 4 }}>Chargement...</Box>
  }

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Mes Commandes' />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
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
                          {statusTranslations[status]?.label}
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
                  placeholder='Rechercher (acheteur, produit)'
                  variant='outlined'
                  size='small'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  sx={{ maxWidth: { sm: '300px' }, width: '100%' }}
                />
              </Box>

              <TableContainer sx={{ overflowX: 'auto', mt: 2 }}>
                <Table aria-label='orders table'>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>
                        <Checkbox />
                      </StyledTableCell>
                      <StyledTableCell>Acheteur</StyledTableCell>
                      <StyledTableCell>Produit(s)</StyledTableCell>
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
                          {order.fields.buyerFirstName?.[0]} {order.fields.buyerLastName?.[0]}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {order.fields.productName?.map((product: string | undefined, index: number) => (
                              <Typography key={index} variant='body2'>
                                {product}
                              </Typography>
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>{order.fields.Qty}</TableCell>
                        <TableCell>{order.fields.totalPrice?.toLocaleString('fr-FR')}</TableCell>
                        <TableCell>
                          <Chip
                            label={statusTranslations[order.fields.Status]?.label || order.fields.Status}
                            color={statusTranslations[order.fields.Status]?.color as 'warning' | 'success' | 'info' || 'default'}
                            size='small'
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell>{new Date(order.createdTime).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <IconButton
                            color='primary'
                            onClick={() => handleViewDetails(order.id)}
                            title='Voir les détails'
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <PDFDownloadLink
                            document={<FacturePDF order={order} />}
                            fileName={`facture-${order.id}.pdf`}
                            className="no-underline"
                          >
                            {({ loading }) => (
                              <IconButton
                                sx={{ color: 'grey.600' }}
                                disabled={loading}
                                title='Télécharger la facture'
                              >
                                <DownloadIcon />
                              </IconButton>
                            )}
                          </PDFDownloadLink>
                          {order.fields.Status !== 'delivered' && (
                            <Button
                              variant='contained'
                              size='small'
                              color='primary'
                              onClick={() => handleNextStatus(order.id, order.fields.Status)}
                              sx={{ minWidth: 'auto', px: 2 }}
                            >
                              {
                                statusTranslations[
                                  statusOrder[statusOrder.indexOf(order.fields.Status) + 1]
                                ]?.label.split(' ')[0]
                              }
                            </Button>
                          )}
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
    </Box>
  )
}

export default MyOrdersPage
