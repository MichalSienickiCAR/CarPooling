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
import { DirectionsCar, Search, Add, ListAlt } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export const Dashboard: React.FC = () => {
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
            Carpooling
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
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
            Panel główny
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Wyszukaj dostępne przejazdy lub zarządzaj swoimi ofertami jako kierowca
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/trips/add')}
              sx={{
                background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                },
              }}
            >
              Dodaj nowy przejazd
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ListAlt />}
              onClick={() => navigate('/trips/mine')}
              sx={{
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              Moje przejazdy
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Search />}
              onClick={() => navigate('/search')}
            >
              Wyszukaj przejazd
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

