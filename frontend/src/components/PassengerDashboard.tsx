import React from 'react';
import { Box, Container, Typography, Button, Paper, Avatar, Stack } from '@mui/material';
import { Search, Logout, Event, AccountBalanceWallet, Person, People, VerifiedUser, History } from '@mui/icons-material';
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700, 
            color: '#00aff5', 
            cursor: 'pointer', 
            ml: 2,
            fontSize: '28px'
          }} 
          onClick={() => navigate('/passenger')}
        >
          Sheero
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mr: 2, alignItems: 'center' }}>
          <Notifications />
          <Button 
            color="inherit" 
            onClick={() => navigate('/profile')} 
            startIcon={<Person />}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              color: '#333',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            Profil
          </Button>
          <Button 
            color="inherit" 
            onClick={handleLogout} 
            startIcon={<Logout />} 
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              color: '#333',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            Wyloguj
          </Button>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 6 }}>
        <Box mb={5} textAlign="center">
          <Typography 
            variant="h3" 
            fontWeight={700} 
            gutterBottom
            sx={{ color: '#1a1a1a' }}
          >
            Panel Pasażera
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ color: '#666', fontWeight: 400 }}
          >
            Planuj swoje podróże szybko i wygodnie
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="center" alignItems="stretch" sx={{ mb: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '32%' } }}>
            <Paper 
              elevation={0} 
              onClick={() => navigate('/search')} 
              sx={{ 
                p: 4, 
                borderRadius: '16px', 
                bgcolor: '#ffffff', 
                cursor: 'pointer', 
                transition: 'all 0.3s', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                border: '2px solid #e0e0e0',
                '&:hover': { 
                  transform: 'translateY(-8px)', 
                  boxShadow: '0 12px 24px rgba(0, 175, 245, 0.15)',
                  border: '2px solid #00aff5',
                } 
              }}
            >
              <Avatar sx={{ width: 70, height: 70, bgcolor: '#00aff5', mb: 2 }}>
                <Search fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
                Wyszukaj Przejazd
              </Typography>
              <Typography color="textSecondary" align="center" sx={{ fontSize: '14px' }}>
                Znajdź kierowcę, zarezerwuj miejsce i ruszaj w drogę.
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '32%' } }}>
            <Paper 
              elevation={0} 
              onClick={() => navigate('/bookings/my')} 
              sx={{ 
                p: 4, 
                borderRadius: '16px', 
                bgcolor: '#ffffff', 
                cursor: 'pointer', 
                transition: 'all 0.3s', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                border: '2px solid #e0e0e0',
                '&:hover': { 
                  transform: 'translateY(-8px)', 
                  boxShadow: '0 12px 24px rgba(52, 168, 83, 0.15)',
                  border: '2px solid #34a853',
                } 
              }}
            >
              <Avatar sx={{ width: 70, height: 70, bgcolor: '#34a853', mb: 2 }}>
                <Event fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
                Moje Rezerwacje
              </Typography>
              <Typography color="textSecondary" align="center" sx={{ fontSize: '14px' }}>
                Zobacz swoje zaakceptowane rezerwacje i nadchodzące przejazdy.
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '32%' } }}>
            <Paper 
              elevation={0} 
              onClick={() => navigate('/wallet')} 
              sx={{ 
                p: 4, 
                borderRadius: '16px', 
                bgcolor: '#ffffff', 
                cursor: 'pointer', 
                transition: 'all 0.3s', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                border: '2px solid #e0e0e0',
                '&:hover': { 
                  transform: 'translateY(-8px)', 
                  boxShadow: '0 12px 24px rgba(251, 188, 5, 0.15)',
                  border: '2px solid #fbbc05',
                } 
              }}
            >
              <Avatar sx={{ width: 70, height: 70, bgcolor: '#fbbc05', mb: 2 }}>
                <AccountBalanceWallet fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
                Portfel
              </Typography>
              <Typography color="textSecondary" align="center" sx={{ fontSize: '14px' }}>
                Zarządzaj saldem, wpłatami i historią transakcji.
              </Typography>
            </Paper>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="center" alignItems="stretch">
          <Box sx={{ width: { xs: '100%', md: '32%' } }}>
            <Paper 
              elevation={0} 
              onClick={() => navigate('/friends')} 
              sx={{ 
                p: 4, 
                borderRadius: '16px', 
                bgcolor: '#ffffff', 
                cursor: 'pointer', 
                transition: 'all 0.3s', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                border: '2px solid #e0e0e0',
                '&:hover': { 
                  transform: 'translateY(-8px)', 
                  boxShadow: '0 12px 24px rgba(156, 39, 176, 0.15)',
                  border: '2px solid #9c27b0',
                } 
              }}
            >
              <Avatar sx={{ width: 70, height: 70, bgcolor: '#9c27b0', mb: 2 }}>
                <People fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
                Znajomi
              </Typography>
              <Typography color="textSecondary" align="center" sx={{ fontSize: '14px' }}>
                Zarządzaj listą znajomych i zaproszeniami.
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '32%' } }}>
            <Paper 
              elevation={0} 
              onClick={() => navigate('/trusted-users')} 
              sx={{ 
                p: 4, 
                borderRadius: '16px', 
                bgcolor: '#ffffff', 
                cursor: 'pointer', 
                transition: 'all 0.3s', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                border: '2px solid #e0e0e0',
                '&:hover': { 
                  transform: 'translateY(-8px)', 
                  boxShadow: '0 12px 24px rgba(76, 175, 80, 0.15)',
                  border: '2px solid #4caf50',
                } 
              }}
            >
              <Avatar sx={{ width: 70, height: 70, bgcolor: '#4caf50', mb: 2 }}>
                <VerifiedUser fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
                Zaufani Użytkownicy
              </Typography>
              <Typography color="textSecondary" align="center" sx={{ fontSize: '14px' }}>
                Lista sprawdzonych współpodróżnych.
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '32%' } }}>
            <Paper 
              elevation={0} 
              onClick={() => navigate('/history')} 
              sx={{ 
                p: 4, 
                borderRadius: '16px', 
                bgcolor: '#ffffff', 
                cursor: 'pointer', 
                transition: 'all 0.3s', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                border: '2px solid #e0e0e0',
                '&:hover': { 
                  transform: 'translateY(-8px)', 
                  boxShadow: '0 12px 24px rgba(255, 87, 34, 0.15)',
                  border: '2px solid #ff5722',
                } 
              }}
            >
              <Avatar sx={{ width: 70, height: 70, bgcolor: '#ff5722', mb: 2 }}>
                <History fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
                Historia
              </Typography>
              <Typography color="textSecondary" align="center" sx={{ fontSize: '14px' }}>
                Zobacz zakończone przejazdy.
              </Typography>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
