import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  AppBar,
  Toolbar,
} from '@mui/material';
import { DirectionsCar, Search, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export const PassengerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <DirectionsCar sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Carpooling - Panel Pasażera
          </Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
            Wyloguj
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            textAlign: 'center',
            background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Panel Pasażera
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Wyszukaj dostępne przejazdy, porównaj oferty i zarezerwuj miejsce w podwózce
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Search />}
            onClick={() => navigate('/search')}
            sx={{
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
              },
              minWidth: 250,
            }}
          >
            Wyszukaj przejazd
          </Button>
        </Paper>
      </Container>
    </>
  );
};

