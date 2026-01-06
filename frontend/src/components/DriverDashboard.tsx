import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Avatar,
} from '@mui/material';
import { Add, ListAlt, Logout, ArrowBack, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#e0e0e0' }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 'bold', color: '#000', cursor: 'pointer', ml: 4 }}
          onClick={() => navigate('/')}
        >
          Sheero
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mr: 4, alignItems: 'center' }}>
          <Button color="inherit" onClick={() => navigate('/profile')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            Profil
          </Button>
          <Button color="inherit" onClick={() => navigate('/dashboard')} startIcon={<ArrowBack />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            Wróć
          </Button>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            Wyloguj
          </Button>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 8 }}>
        <Box mb={6} textAlign="center">
          <Typography variant="h3" fontWeight="bold" gutterBottom>Panel Kierowcy</Typography>
          <Typography variant="h6" color="textSecondary">Zarządzaj swoimi podróżami w jednym miejscu</Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
        >
          <Box sx={{ width: { xs: '100%', md: '30%' } }}>
            <Paper
              elevation={0}
              onClick={() => navigate('/trips/add')}
              sx={{
                p: 4,
                borderRadius: '30px',
                bgcolor: '#f5f5f5',
                cursor: 'pointer',
                transition: 'all 0.3s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid transparent',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: '#c62828',
                  bgcolor: '#ffebee'
                }
              }}
            >
              <Avatar sx={{ width: 60, height: 60, bgcolor: '#c62828', mb: 2 }}>
                <Add fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>Dodaj Przejazd</Typography>
              <Typography color="textSecondary" align="center">Opublikuj nową ofertę przejazdu i znajdź pasażerów.</Typography>
            </Paper>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '30%' } }}>
            <Paper
              elevation={0}
              onClick={() => navigate('/trips/mine')}
              sx={{
                p: 4,
                borderRadius: '30px',
                bgcolor: '#f5f5f5',
                cursor: 'pointer',
                transition: 'all 0.3s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid transparent',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: '#424242',
                  bgcolor: '#eeeeee'
                }
              }}
            >
              <Avatar sx={{ width: 60, height: 60, bgcolor: '#424242', mb: 2 }}>
                <ListAlt fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>Moje Przejazdy</Typography>
              <Typography color="textSecondary" align="center">Historia, edycja i zarządzanie aktywnymi ogłoszeniami.</Typography>
            </Paper>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '30%' } }}>
            <Paper
              elevation={0}
              onClick={() => navigate('/profile')}
              sx={{
                p: 4,
                borderRadius: '30px',
                bgcolor: '#f5f5f5',
                cursor: 'pointer',
                transition: 'all 0.3s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid transparent',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: '#1976d2',
                  bgcolor: '#e3f2fd'
                }
              }}
            >
              <Avatar sx={{ width: 60, height: 60, bgcolor: '#1976d2', mb: 2 }}>
                <Person fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>Mój Profil</Typography>
              <Typography color="textSecondary" align="center">Edytuj swoje dane, zmień zdjęcie i ustawienia konta.</Typography>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

