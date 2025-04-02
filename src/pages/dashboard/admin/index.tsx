import React from 'react';
import { Box, Typography } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord Administrateur
      </Typography>
      <Typography variant="body1">
        Bienvenue dans le tableau de bord administrateur.
      </Typography>
    </Box>
  );
};

export default AdminDashboard; 