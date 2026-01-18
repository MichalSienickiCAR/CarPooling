import React, { useEffect, useState } from 'react';
import { Box, Container, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const profile = await authService.getUserProfile();
        const role = profile?.preferred_role;
        
        if (role === 'driver') {
          navigate('/driver', { replace: true });
        } else if (role === 'passenger') {
          navigate('/passenger', { replace: true });
        } else {
          // Jeśli rola nie jest ustawiona, wyloguj użytkownika
          authService.logout();
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        authService.logout();
        navigate('/login', { replace: true });
      }
    };
    fetchUserRole();
  }, [navigate]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
};
