import { withAuth } from '@/components/auth/withAuth';
import React from 'react';
import { Box, Typography } from '@mui/material';

const BuyerDashboard = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord Acheteur
      </Typography>
      <Typography variant="body1">
        Bienvenue dans le tableau de bord acheteur.
      </Typography>
    </Box>
  );
};

export default withAuth(BuyerDashboard); 