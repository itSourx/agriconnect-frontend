import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import api from 'src/api/axiosConfig';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': { fontWeight: 'bold' },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
  '&:last-child td, &:last-child th': { border: 0 },
}));

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [productFilter, setProductFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession(); // Récupère la session NextAuth

  const statusTranslations = {
    pending: { label: 'En attente', color: 'warning' },
    confirmed: { label: 'Confirmée', color: 'success' },
    delivered: { label: 'Livrée', color: 'info' },
  };

  const statusOrder = ['pending', 'confirmed', 'delivered'];

  useEffect(() => {
    if (status === 'loading') return; // Attend que la session soit chargée
    if (status === 'unauthenticated') {
      router.push('/auth/login'); 
      return;
    }

    const fetchOrders = async () => {
      const userId = session?.user?.id; // Récupère l'ID utilisateur depuis la session

      if (!userId) {
        router.push('/auth/login');
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get('https://agriconnect-bc17856a61b8.herokuapp.com/orders', {
          headers: { accept: '*/*' },
        });

        const farmerOrders = response.data
          .filter(order => order.fields.farmerId?.includes(userId))
          .map(order => {
            const farmerProductIndices = order.fields.farmerId
              .map((id, index) => (id === userId ? index : -1))
              .filter(index => index !== -1);

            return {
              ...order,
              fields: {
                ...order.fields,
                products: farmerProductIndices.map(i => order.fields.products[i]),
                productName: farmerProductIndices.map(i => order.fields.productName[i]),
                farmerId: farmerProductIndices.map(i => order.fields.farmerId[i]),
                farmerFirstName: farmerProductIndices.map(i => order.fields.farmerFirstName[i]),
                farmerLastName: farmerProductIndices.map(i => order.fields.farmerLastName[i]),
              },
            };
          })
          .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

        setOrders(farmerOrders);
        setFilteredOrders(farmerOrders);
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [router, session, status]);

  useEffect(() => {
    let filtered = [...orders];

    if (productFilter) {
      filtered = filtered.filter(order => order.fields.productName?.includes(productFilter));
    }
    if (statusFilter) {
      filtered = filtered.filter(order => order.fields.Status === statusFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        order =>
          order.fields.buyerFirstName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.buyerLastName?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fields.productName?.some(name => name?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredOrders(filtered);
    setPage(0);
  }, [productFilter, statusFilter, searchQuery, orders]);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleNextStatus = async (orderId, currentStatus) => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusOrder.length - 1) return;

    const nextStatus = statusOrder[currentIndex + 1];
    const token = session?.accessToken; // Récupère le token depuis la session

    try {
      await api.put(
        `https://agriconnect-bc17856a61b8.herokuapp.com/orders/${orderId}`,
        { fields: { Status: nextStatus } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setOrders(
        orders.map(order =>
          order.id === orderId ? { ...order, fields: { ...order.fields, Status: nextStatus } } : order
        )
      );
      setFilteredOrders(
        filteredOrders.map(order =>
          order.id === orderId ? { ...order, fields: { ...order.fields, Status: nextStatus } } : order
        )
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleViewDetails = id => {
    router.push(`/orders/myordersdetails/${id}`); 
  };

  const generateInvoicePDF = order => {
    const doc = new jsPDF();
    const user = session?.user;
    const date = new Date(order.createdTime).toLocaleDateString('fr-FR');
  
    doc.setFontSize(20);
    doc.text('Facture', 105, 20, { align: 'center' });
  
    doc.setFontSize(12);
    doc.text('Émise par:', 20, 40);
    doc.setFontSize(10);
    doc.text(`${user?.FirstName} ${user?.LastName}`, 20, 50);
    doc.text(`Email: ${user?.email}`, 20, 60);
    doc.text(`Téléphone: ${user?.Phone || 'Non spécifié'}`, 20, 70);
    doc.text(`Adresse: ${user?.Address || 'Non spécifiée'}`, 20, 80);
    doc.text(`IFU: ${user?.ifu || 'Non spécifié'}`, 20, 90);
    doc.text(`Raison Sociale: ${user?.raisonSociale || 'Non spécifiée'}`, 20, 100);
  
    doc.text('Destinataire:', 120, 40);
    doc.text(`${order.fields.buyerFirstName?.[0]} ${order.fields.buyerLastName?.[0]}`, 120, 50);
    doc.text(`Email: ${order.fields.buyerEmail?.[0]}`, 120, 60);
  
    doc.setFontSize(12);
    doc.text(`N° Commande: ${order.id}`, 20, 120);
    doc.text(`Date: ${date}`, 20, 130);
    doc.text(`Statut: ${statusTranslations[order.fields.Status]?.label || order.fields.Status}`, 20, 140);
  
    const tableData = order.fields.productName.map((product, index) => [
      product,
      order.fields.Qty.toString(),
      (order.fields.totalPrice / order.fields.productName.length).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }),
    ]);
  
    doc.autoTable({
      startY: 170,
      head: [['Produit', 'Quantité', 'Prix unitaire']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 10 },
    });
  
    const finalY = doc.lastAutoTable.finalY || 170;
    doc.setFontSize(12);
    doc.text(`Total: ${order.fields.totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}`, 150, finalY + 10, { align: 'right' });
  
    doc.setFontSize(8);
    doc.text('Merci pour votre achat!', 105, 280, { align: 'center' });
    doc.text('AgriConnect - Plateforme de mise en relation agricole', 105, 285, { align: 'center' });
  
    doc.save(`Facture_${order.id}_${date}.pdf`);
  };

  const products = [...new Set(orders.flatMap(o => o.fields.productName).filter(Boolean))];
  const statuses = ['pending', 'confirmed', 'delivered'];

  if (status === 'loading' || isLoading) {
    return <Box sx={{ p: 4 }}>Chargement...</Box>;
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
                        <TableCell>{order.fields.productName?.join(', ')}</TableCell>
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
                            onClick={() => handleViewDetails(order.id)}
                            startIcon={<i className='ri-eye-line text-[22px] text-textSecondary'></i>}
                            sx={{ marginRight: 1 }}
                          >
                            Détails
                          </Button>
                          {order.fields.Status !== 'delivered' && (
                            <Button
                              variant='contained'
                              size='small'
                              color='primary'
                              onClick={() => handleNextStatus(order.id, order.fields.Status)}
                              startIcon={<i className='ri-arrow-right-line text-[22px] text-textSecondary'></i>}
                              sx={{ marginRight: 1 }}
                            >
                              {statusTranslations[statusOrder[statusOrder.indexOf(order.fields.Status) + 1]]?.label}
                            </Button>
                          )}
                          <Button
                            variant='contained'
                            size='small'
                            color='secondary'
                            onClick={() => generateInvoicePDF(order)}
                            startIcon={<i className='ri-file-pdf-line text-[22px] text-textSecondary'></i>}
                          >
                            Facture
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
    </Box>
  )
}

export default MyOrdersPage
