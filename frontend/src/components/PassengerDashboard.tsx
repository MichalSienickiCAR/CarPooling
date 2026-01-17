import React from 'react';
import { Box, Container, Typography, Button, Paper, Avatar, Stack } from '@mui/material';
import { Search, Logout, ArrowBack, Person, Event } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Notifications } from './Notifications';

export const PassengerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#e0e0e0' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#000', cursor: 'pointer', ml: 4 }} onClick={() => navigate('/')}>Sheero</Typography>
        <Box sx={{ display: 'flex', gap: 2, mr: 4, alignItems: 'center' }}>
          <Notifications />
          <Button color="inherit" onClick={() => navigate('/dashboard')} startIcon={<ArrowBack />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Wróć</Button>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Wyloguj</Button>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 8 }}>
        <Box mb={6} textAlign="center">
          <Typography variant="h3" fontWeight="bold" gutterBottom>Panel Pasażera</Typography>
          <Typography variant="h6" color="textSecondary">Planuj swoje podróże szybko i wygodnie</Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center" alignItems="stretch">
          <Box sx={{ width: { xs: '100%', md: '30%' } }}>
            <Paper elevation={0} onClick={() => navigate('/search')} sx={{ p: 4, borderRadius: '30px', bgcolor: '#f5f5f5', cursor: 'pointer', transition: 'all 0.3s', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid transparent', '&:hover': { transform: 'translateY(-5px)', borderColor: '#c62828', bgcolor: '#ffebee' } }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: '#c62828', mb: 2 }}><Search fontSize="large" /></Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>Wyszukaj Przejazd</Typography>
              <Typography color="textSecondary" align="center">Znajdź kierowcę, zarezerwuj miejsce i ruszaj w drogę.</Typography>
            </Paper>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '30%' } }}>
            <Paper elevation={0} onClick={() => navigate('/bookings/my')} sx={{ p: 4, borderRadius: '30px', bgcolor: '#f5f5f5', cursor: 'pointer', transition: 'all 0.3s', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid transparent', '&:hover': { transform: 'translateY(-5px)', borderColor: '#4caf50', bgcolor: '#f1f8f4' } }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: '#4caf50', mb: 2 }}><Event fontSize="large" /></Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>Moje Rezerwacje</Typography>
              <Typography color="textSecondary" align="center">Zobacz swoje zaakceptowane rezerwacje i nadchodzące przejazdy.</Typography>
            </Paper>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '30%' } }}>
            <Paper elevation={0} onClick={() => navigate('/wallet')} sx={{ p: 4, borderRadius: '30px', bgcolor: '#f5f5f5', cursor: 'pointer', transition: 'all 0.3s', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid transparent', '&:hover': { transform: 'translateY(-5px)', borderColor: '#ff9800', bgcolor: '#fff3e0' } }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: '#ff9800', mb: 2 }}><Person fontSize="large" /></Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>Portfel</Typography>
              <Typography color="textSecondary" align="center">Zarządzaj saldem, wpłatami i historią transakcji.</Typography>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
