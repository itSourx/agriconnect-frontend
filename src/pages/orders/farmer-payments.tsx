import React, { useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import { styled, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CircularProgress } from '@mui/material'
import { toast } from 'react-hot-toast'
import PaymentIcon from '@mui/icons-material/Payment'
import { useOrders, FarmerPayment } from '@/hooks/useOrders'
import FarmerPaymentDialog from '@/components/FarmerPaymentDialog'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': { 
    fontWeight: 'bold',
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderBottom: 'none'
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02)
  },
  '&:last-child td, &:last-child th': { border: 0 },
}));

const FarmerPaymentsPage = () => {
  const { getFarmerPayments, loading, error, fetchOrders } = useOrders()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedFarmerPayment, setSelectedFarmerPayment] = useState<FarmerPayment | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  // Guard de navigation - Empêcher l'accès aux profils non-admin
  React.useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    // Vérifier si l'utilisateur a les permissions d'admin
    const isAdmin = session?.user?.profileType === 'ADMIN' || session?.user?.profileType === 'SUPERADMIN'
    
    if (!isAdmin) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handlePaymentClick = (farmerPayment: FarmerPayment) => {
    setSelectedFarmerPayment(farmerPayment)
    setPaymentDialogOpen(true)
  }

  const handlePaymentSuccess = () => {
    fetchOrders() // Refresh orders after successful payment
    toast.success('Paiement effectué avec succès !')
  }

  const farmerPayments = getFarmerPayments()

  // Afficher un écran de chargement pendant la vérification des permissions
  if (status === 'loading' || !session?.user?.profileType || 
      (session?.user?.profileType !== 'ADMIN' && session?.user?.profileType !== 'SUPERADMIN')) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4, mb: 3 }}>
            <Box>
              <Typography variant='h5' mb={1} sx={{ fontWeight: 'bold' }}>
                Paiement des agriculteurs
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Gérez les paiements des agriculteurs pour leurs commandes payées
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {farmerPayments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PaymentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Aucun paiement en attente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tous les agriculteurs ont été payés ou aucune commande n'est éligible au paiement.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table aria-label='farmer payments table'>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Agriculteur</StyledTableCell>
                        <StyledTableCell>Compte OWO</StyledTableCell>
                        <StyledTableCell>Nombre de commandes</StyledTableCell>
                        <StyledTableCell>Montant total (F CFA)</StyledTableCell>
                        <StyledTableCell>Actions</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {farmerPayments
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((farmerPayment) => (
                        <StyledTableRow key={farmerPayment.farmerId}>
                          <TableCell>
                            <Typography variant="body1" fontWeight={500}>
                              {farmerPayment.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {farmerPayment.compteOwo}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {farmerPayment.totalProducts}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="h6" fontWeight={600} color="primary">
                              {farmerPayment.totalAmount.toLocaleString('fr-FR')} F CFA
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handlePaymentClick(farmerPayment)}
                              startIcon={<PaymentIcon />}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3
                              }}
                            >
                              Payer
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
                  count={farmerPayments.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Dialog de paiement des agriculteurs */}
      <FarmerPaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        farmerPayment={selectedFarmerPayment}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </Box>
  )
}

export default FarmerPaymentsPage 