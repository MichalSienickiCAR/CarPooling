import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Paper, Stack, Avatar, CircularProgress } from '@mui/material';
import { DirectionsCar, Search, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'driver' | 'passenger' | 'both' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const profile = await authService.getUserProfile();
        const role = (profile && (profile.preferred_role as 'driver' | 'passenger' | 'both')) || null;
        setUserRole(role);
        if (role) localStorage.setItem('userRole', role);
        if (role === 'driver') {
          navigate('/driver', { replace: true });
        } else if (role === 'passenger') {
          navigate('/passenger', { replace: true });
        } else {
          setLoading(false);
        }
      } catch (error) {
        const storedRole = localStorage.getItem('userRole') as 'driver' | 'passenger' | 'both' | null;
        if (storedRole === 'driver') {
          navigate('/driver', { replace: true });
        } else if (storedRole === 'passenger') {
          navigate('/passenger', { replace: true });
        } else {
          setLoading(false);
        }
      }
    };
    fetchUserRole();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#e0e0e0' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#000', cursor: 'pointer', ml: 4 }} onClick={() => navigate('/')}>Sheero</Typography>
        <Box sx={{ display: 'flex', gap: 2, mr: 4 }}>
          <Button color="inherit" onClick={() => navigate('/profile')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Mój profil</Button>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Wyloguj</Button>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
        <Stack alignItems="center" spacing={6} width="100%">
          <Box textAlign="center">
            <Typography variant="h3" fontWeight="bold" gutterBottom>Witaj w Sheero</Typography>
            <Typography variant="h6" color="textSecondary">Wybierz tryb, w którym chcesz kontynuować</Typography>
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center" width="100%">
            <Paper elevation={0} onClick={() => navigate('/driver')} sx={{ p: 5, borderRadius: '40px', bgcolor: '#f5f5f5', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', border: '2px solid transparent', width: { xs: '100%', md: '45%' }, '&:hover': { transform: 'translateY(-5px)', borderColor: '#c62828', bgcolor: '#ffebee' } }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#c62828', mx: 'auto', mb: 3 }}>
                <DirectionsCar fontSize="large" />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" gutterBottom>Kierowca</Typography>
              <Typography color="textSecondary">Dodawaj przejazdy, zarządzaj pasażerami i zarabiaj na wspólnych trasach.</Typography>
            </Paper>

            <Paper elevation={0} onClick={() => navigate('/passenger')} sx={{ p: 5, borderRadius: '40px', bgcolor: '#f5f5f5', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', border: '2px solid transparent', width: { xs: '100%', md: '45%' }, '&:hover': { transform: 'translateY(-5px)', borderColor: '#c62828', bgcolor: '#ffebee' } }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#424242', mx: 'auto', mb: 3 }}>
                <Search fontSize="large" />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" gutterBottom>Pasażer</Typography>
              <Typography color="textSecondary">Szukaj przejazdów, rezerwuj miejsca i podróżuj taniej i wygodniej.</Typography>
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
