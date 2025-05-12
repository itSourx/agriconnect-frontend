import { withAuth } from '@/components/auth/withAuth';
import React from 'react';
import { Box, Typography } from '@mui/material';
import AdminDashboardContent from 'src/views/dashboard/AdminDashboardContent';

const AdminDashboard = () => {
  return <AdminDashboardContent />;
};

export default withAuth(AdminDashboard); 