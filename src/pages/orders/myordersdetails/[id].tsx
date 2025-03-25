import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Box, Typography, Paper, Grid, LinearProgress, Button, Avatar } from '@mui/material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FacturePDF from '@/components/FacturePDF';
import { Order } from '@/types/order';
import * as XLSX from 'xlsx';

const OrderDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Traduction, progression et couleurs des statuts
  const statusTranslations = {
    pending: { label: 'En attente', progress: 20, color: 'warning' },
    confirmed: { label: 'Confirmée', progress: 66, color: 'success' },
    delivered: { label: 'Livrée', progress: 100, color: 'info' },
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
      "Produit": order.fields.productName?.[0] || 'N/A',
      "Quantité": order.fields.Qty || 'N/A',
      "Prix Total (F CFA)": order.fields.totalPrice?.toLocaleString('fr-FR') || 'N/A',
      "Statut": statusTranslations[order.fields.Status]?.label || order.fields.Status || 'N/A',
      "Date de création": new Date(order.createdTime).toLocaleString(),
    }];

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Détails Commande');
    XLSX.writeFile(workbook, `commande_${id}_details.xlsx`);
  };

  if (loading) return <Typography>Chargement...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Détails de la Commande
      </Typography>

      {loading ? (
        <LinearProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : order ? (
        <Grid container spacing={3}>
          {/* Informations de l'acheteur */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informations de l'acheteur
              </Typography>
              <Typography>
                Nom : {order.fields.buyerFirstName?.[0]} {order.fields.buyerLastName?.[0]}
              </Typography>
              <Typography>
                Email : {order.fields.buyerEmail?.[0]}
              </Typography>
              <Typography>
                Téléphone : {order.fields.buyerPhone?.[0]}
              </Typography>
              <Typography>
                Adresse : {order.fields.buyerAddress?.[0]}
              </Typography>
            </Paper>
          </Grid>

          {/* Informations du vendeur */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informations du vendeur
              </Typography>
              <Typography>
                Nom : {order.fields.farmerFirstName?.[0]} {order.fields.farmerLastName?.[0]}
              </Typography>
              <Typography>
                Email : {order.fields.farmerEmail?.[0]}
              </Typography>
              <Typography>
                Téléphone : {order.fields.farmerPhone?.[0]}
              </Typography>
              <Typography>
                Adresse : {order.fields.farmerAddress?.[0]}
              </Typography>
            </Paper>
          </Grid>

          {/* Détails de la commande */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Détails de la commande
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={2}>
                  <Avatar
                    src={order.fields.productImage?.[0]}
                    alt={order.fields.productName?.[0] || ''}
                    sx={{ width: 100, height: 100 }}
                  />
                </Grid>
                <Grid item xs={12} md={10}>
                  <Typography variant="h6">{order.fields.productName?.[0]}</Typography>
                  <Typography>
                    Quantité : {order.fields.Qty}
                  </Typography>
                  <Typography>
                    Prix unitaire : {order.fields.unitPrice?.toLocaleString('fr-FR')} F CFA
                  </Typography>
                  <Typography>
                    Prix total : {order.fields.totalPrice?.toLocaleString('fr-FR')} F CFA
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Statut de la commande */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Statut de la commande
              </Typography>
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={statusTranslations[order.fields.Status]?.progress || 0}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  {statusTranslations[order.fields.Status]?.label}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Bouton de téléchargement de la facture */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <PDFDownloadLink
                document={<FacturePDF order={order} />}
                fileName={`facture-${order.id}.pdf`}
                className="no-underline"
              >
                {({ loading }) => (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={<i className="ri-download-line"></i>}
                  >
                    {loading ? 'Génération de la facture...' : 'Télécharger la facture'}
                  </Button>
                )}
              </PDFDownloadLink>
            </Box>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
};

export default OrderDetailsPage;
