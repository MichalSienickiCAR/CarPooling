import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    AppBar,
    Toolbar,
    TextField,
    InputAdornment,
    Paper,
    Avatar,
    IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export const LandingPage = () => {
    const navigate = useNavigate();
    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');

    const isAuthenticated = !!localStorage.getItem('token');

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
            {/* Navbar */}
            <AppBar position="static" color="transparent" elevation={0} sx={{ bgcolor: '#e0e0e0' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography
                        variant="h6" component="div"
                        sx={{ fontWeight: 'bold', color: '#000', ml: 4, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        Sheero
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button color="inherit" sx={{ textTransform: 'none' }} onClick={() => navigate('/search')}>
                            Wyszukaj
                        </Button>

                        {isAuthenticated ? (
                            <>
                                <Button color="inherit" sx={{ textTransform: 'none' }} onClick={() => navigate('/dashboard')}>
                                    Panel
                                </Button>
                                <Button color="inherit" sx={{ textTransform: 'none' }} onClick={() => navigate('/trips/add')}>
                                    Dodaj przejazd
                                </Button>
                                <IconButton onClick={() => navigate('/profile')}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#757575', fontSize: '14px' }}>Me</Avatar>
                                </IconButton>
                                <IconButton onClick={handleLogout} title="Wyloguj">
                                    <LogoutIcon />
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        borderColor: '#9e9e9e',
                                        color: '#000'
                                    }}
                                    onClick={() => navigate('/login')}
                                >
                                    Zaloguj
                                </Button>
                                <Button
                                    variant="contained"
                                    disableElevation
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        bgcolor: '#c62828',
                                        '&:hover': { bgcolor: '#b71c1c' }
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

            {/* Hero Section with Search */}
            <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: '12px',
                        borderRadius: '50px',
                        bgcolor: '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap'
                    }}
                >
                    {/* Departure */}
                    <Paper
                        component="form"
                        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', borderRadius: '30px', flex: 1, boxShadow: 'none' }}
                    >
                        <TextField
                            placeholder="Miejsce wyjazdu"
                            variant="standard"
                            fullWidth
                            InputProps={{
                                disableUnderline: true,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                style: { paddingLeft: '15px' }
                            }}
                            value={departure}
                            onChange={(e) => setDeparture(e.target.value)}
                        />
                    </Paper>

                    {/* Destination */}
                    <Paper
                        component="form"
                        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', borderRadius: '30px', flex: 1, boxShadow: 'none' }}
                    >
                        <TextField
                            placeholder="Miejsce docelowe"
                            variant="standard"
                            fullWidth
                            InputProps={{
                                disableUnderline: true,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                style: { paddingLeft: '15px' }
                            }}
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                    </Paper>

                    {/* Date & Passenger */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, px: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#424242', cursor: 'pointer' }}>
                            <CalendarTodayIcon fontSize="small" />
                            <Typography>Dzisiaj</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#424242', cursor: 'pointer' }}>
                            <PersonOutlineIcon />
                            <Typography>1 pasażer</Typography>
                        </Box>
                    </Box>

                    {/* Search Button */}
                    <Button
                        variant="contained"
                        sx={{
                            borderRadius: '30px',
                            bgcolor: '#c62828',
                            px: 5,
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': { bgcolor: '#b71c1c' }
                        }}
                        onClick={() => navigate('/search')}
                    >
                        Szukaj
                    </Button>
                </Paper>
            </Container>

            {/* Testimonials */}
            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Nasi najlepsi kierowcy
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
                    Opinie od pasażerów
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            ~Adam Z.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            "Super kierowca, najlepsza aplikacja!"
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            ~Monika O
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            "Blablacar przy tej aplikacji to jak kebab przy restauracji. Kocham ją!"
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};
