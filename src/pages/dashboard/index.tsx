import { withAuth } from '@/components/auth/withAuth';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { CircularProgress, Box } from '@mui/material';
import AdminDashboard from './admin';
import FarmerDashboard from './agriculteur';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.profileType === 'AGRICULTEUR') {
      router.push('/dashboard/agriculteur');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  switch (session.user?.profileType) {
    case 'ADMIN':
    case 'SUPERADMIN':
      return <AdminDashboard />;
    case 'ACHETEUR':
      return <FarmerDashboard />;
    case 'AGRICULTEUR':
      return <FarmerDashboard />;
    default:
      return null;
  }
};

export default withAuth(Dashboard); 