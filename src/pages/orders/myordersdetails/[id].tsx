import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import * as XLSX from 'xlsx';

const OrderDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Traduction, progression et couleurs des statuts
  const statusTranslations = {
    pending: { label: 'En attente', progress: 20, color: 'warning' },  // Orange pour Pending
    confirmed: { label: 'Confirmée', progress: 66, color: 'success' }, // Vert pour Confirmed
    delivered: { label: 'Livrée', progress: 100, color: 'info' },      // Bleu pour Delivered
  };

  // Charger les détails de la commande
  useEffect(() => {
    if (id) {
      fetch(`https://agriconnect-bc17856a61b8.herokuapp.com/orders/${id}`, {
        headers: { 'accept': '*/*' },
      })
        .then(response => {
          if (!response.ok) throw new Error('Commande non trouvée');
          return response.json();
        })
        .then(data => {
          setOrder(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Erreur lors du chargement de la commande:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  // Exporter les détails en Excel
  const handleExport = () => {
    if (!order) return;

    const exportData = [{
      "ID Commande": order.id,
      "Nom Acheteur": `${order.fields.buyerFirstName?.[0]} ${order.fields.buyerLastName?.[0]}`,
      "Email Acheteur": order.fields.buyerEmail?.[0] || 'N/A',
      "Téléphone Acheteur": order.fields.buyerPhone?.[0] || 'N/A',
      "Adresse Acheteur": order.fields.buyerAddress?.[0] || 'N/A',
      "Nom Vendeur": `${order.fields.farmerFirstName?.[0]} ${order.fields.farmerLastName?.[0]}`,
    //   "Email Vendeur": order.fields.farmerEmail?.[0] || 'N/A',
      "Produit": order.fields.productName?.[0] || 'N/A',
      "Quantité": order.fields.Qty || 'N/A',
      "Prix Total (F CFA)": order.fields.totalPrice?.toLocaleString('fr-FR') || 'N/A',
      "Statut": statusTranslations[order.fields.Status]?.label || order.fields.Status || 'N/A',
      "Date de création": new Date(order.createdTime).toLocaleString(),
    }];

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Détails Commande');
    XLSX.writeFile(workbook, `order_${id}_details.xlsx`);
  };

  if (loading) return <Typography>Chargement...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  // Vérifiez la valeur du statut
  console.log('Statut de la commande:', order.fields.Status);
  console.log(statusTranslations[order.fields.Status]?.progress )

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={`Détails de la commande ${id}`}
              action={
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<i className="ri-upload-2-line"></i>}
                    onClick={handleExport}
                  >
                    Exporter
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => router.push('/orders')}
                    startIcon={<i className="ri-arrow-left-line"></i>}
                  >
                    Retour
                  </Button>
                </Box>
              }
            />
            <CardContent>
              <Grid container spacing={4}>
                {/* Bloc Acheteur */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" gutterBottom>
                    Informations de l'acheteur
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography><strong>Nom :</strong> {order.fields.buyerFirstName?.[0]} {order.fields.buyerLastName?.[0]}</Typography>
                    <Typography><strong>Email :</strong> {order.fields.buyerEmail?.[0]}</Typography>
                    <Typography><strong>Téléphone :</strong> {order.fields.buyerPhone?.[0]}</Typography>
                    <Typography><strong>Adresse :</strong> {order.fields.buyerAddress?.[0]}</Typography>
                  </Box>
                </Grid>

                {/* Bloc Vendeur */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" gutterBottom>
                    Informations du vendeur
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography><strong>Nom :</strong> {order.fields.farmerFirstName?.[0]} {order.fields.farmerLastName?.[0]}</Typography>
                    {/* <Typography><strong>Email :</strong> {order.fields.farmerEmail?.[0]}</Typography> */}
                  </Box>
                </Grid>

                {/* Bloc Autres détails */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" gutterBottom>
                    Autres détails
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography><strong>Produit :</strong> {order.fields.productName?.[0]}</Typography>
                    <Typography><strong>Quantité :</strong> {order.fields.Qty}</Typography>
                    <Typography><strong>Prix total :</strong> {order.fields.totalPrice?.toLocaleString('fr-FR')} F CFA</Typography>
                    <Typography><strong>Date de création :</strong> {new Date(order.createdTime).toLocaleString()}</Typography>
                  </Box>
                </Grid>

                {/* Barre de progression */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Progression de la transaction
                  </Typography>
                  <LinearProgress
                    color={statusTranslations[order.fields.Status]?.color || 'primary'}
                    value={statusTranslations[order.fields.Status]?.progress || 0}
                    variant="determinate"
                    sx={{
                      height: 20,
                      borderRadius: 5,
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Statut actuel : <strong>{statusTranslations[order.fields.Status]?.label || order.fields.Status}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderDetailsPage;
