import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/api';
import { Box, CircularProgress } from '@mui/material';

interface RoleProtectedRouteProps {
  allowedRole: 'driver' | 'passenger';
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRole }) => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'driver' | 'passenger' | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkRole = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authService.getUserProfile();
        setUserRole(profile.preferred_role);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (userRole !== allowedRole) {
    // Przekieruj do odpowiedniego panelu użytkownika
    return <Navigate to={`/${userRole}`} replace />;
  }

  return <Outlet />;
};
