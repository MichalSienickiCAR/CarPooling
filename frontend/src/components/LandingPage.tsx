import React, { useState } from 'react';
import { Box, Container, Typography, Button, AppBar, Toolbar, TextField, InputAdornment, Paper, Avatar, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              color: '#00aff5', 
              ml: 2, 
              cursor: 'pointer',
              fontSize: '28px'
            }} 
            onClick={() => navigate('/')}
          >
            Sheero
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
            <Button 
              color="inherit" 
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600, 
                color: '#333',
                '&:hover': { backgroundColor: '#f5f5f5' }
              }} 
              onClick={() => navigate('/search')}
            >
              Wyszukaj
            </Button>
            {isAuthenticated ? (
              <>
                <Button 
                  color="inherit" 
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 600, 
                    color: '#333',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }} 
                  onClick={() => navigate('/dashboard')}
                >
                  Panel
                </Button>
                <Button 
                  color="inherit" 
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 600, 
                    color: '#333',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }} 
                  onClick={() => navigate('/trips/add')}
                >
                  Dodaj przejazd
                </Button>
                <IconButton onClick={() => navigate('/profile')}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#00aff5' }}>
                    <PersonOutlineIcon />
                  </Avatar>
                </IconButton>
                <IconButton 
                  onClick={handleLogout} 
                  title="Wyloguj"
                  sx={{ 
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </>
            ) : (
              <>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    textTransform: 'none', 
                    borderRadius: '12px', 
                    borderColor: '#00aff5', 
                    color: '#00aff5',
                    fontWeight: 600,
                    '&:hover': { 
                      borderColor: '#0099d6', 
                      backgroundColor: 'rgba(0, 175, 245, 0.04)' 
                    }
                  }} 
                  onClick={() => navigate('/login')}
                >
                  Zaloguj
                </Button>
                <Button 
                  variant="contained" 
                  sx={{ 
                    textTransform: 'none', 
                    borderRadius: '12px', 
                    bgcolor: '#00aff5',
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': { 
                      bgcolor: '#0099d6',
                      boxShadow: '0 4px 8px rgba(0, 175, 245, 0.2)'
                    }
                  }} 
                  onClick={() => navigate('/register')}
                >
                  Rejestracja
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: '20px', 
            bgcolor: '#ffffff',
            border: '1px solid #e0e0e0',
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            flexWrap: 'wrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <TextField 
            placeholder="Skąd?" 
            variant="outlined"
            fullWidth
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#f8f9fa',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: '#00aff5',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00aff5',
                },
              },
            }}
            InputProps={{ 
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#00aff5' }} />
                </InputAdornment>
              )
            }} 
            value={departure} 
            onChange={(e) => setDeparture(e.target.value)} 
          />
          <TextField 
            placeholder="Dokąd?" 
            variant="outlined"
            fullWidth
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#f8f9fa',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: '#00aff5',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00aff5',
                },
              },
            }}
            InputProps={{ 
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#00aff5' }} />
                </InputAdornment>
              )
            }} 
            value={destination} 
            onChange={(e) => setDestination(e.target.value)} 
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#666', cursor: 'pointer' }}>
              <CalendarTodayIcon fontSize="small" sx={{ color: '#00aff5' }} />
              <Typography fontWeight={600}>Dzisiaj</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#666', cursor: 'pointer' }}>
              <PersonOutlineIcon sx={{ color: '#00aff5' }} />
              <Typography fontWeight={600}>1 pasażer</Typography>
            </Box>
          </Box>
          <Button 
            variant="contained" 
            sx={{ 
              borderRadius: '12px', 
              bgcolor: '#00aff5', 
              px: 5, 
              py: 1.5, 
              textTransform: 'none', 
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0, 175, 245, 0.3)',
              '&:hover': { 
                bgcolor: '#0099d6',
                boxShadow: '0 6px 16px rgba(0, 175, 245, 0.4)'
              }
            }} 
            onClick={() => navigate('/search')}
          >
            Szukaj
          </Button>
        </Paper>
      </Container>

      <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            color: '#1a1a1a'
          }}
        >
          Nasi najlepsi kierowcy
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 6,
            color: '#666'
          }}
        >
          Opinie od pasażerów
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Paper 
            elevation={0}
            sx={{ 
              flex: 1, 
              p: 4, 
              borderRadius: '16px',
              bgcolor: '#ffffff',
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: '#1a1a1a'
              }}
            >
              ~Adam Z.
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: '#666' }}
            >
              "Super kierowca, najlepsza aplikacja!"
            </Typography>
          </Paper>
          <Paper 
            elevation={0}
            sx={{ 
              flex: 1, 
              p: 4, 
              borderRadius: '16px',
              bgcolor: '#ffffff',
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: '#1a1a1a'
              }}
            >
              ~Monika O
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: '#666' }}
            >
              "Blablacar przy tej aplikacji to jak kebab przy restauracji. Kocham ją!"
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};
