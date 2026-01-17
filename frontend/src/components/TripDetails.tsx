import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Stack,
    Avatar,
    Divider,
    Chip,
    CircularProgress
} from '@mui/material';
import { ArrowBack, Logout, Place, DirectionsCar, Star, SmokingRooms, Pets, MusicNote } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { tripService, authService, Trip } from '../services/api';

export const TripDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrip = async () => {
            if (!id) return;
            try {
                const data = await tripService.getTrip(id);
                setTrip(data);
            } catch (error) {
                enqueueSnackbar('Nie udało się pobrać szczegółów przejazdu.', { variant: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchTrip();
    }, [id, enqueueSnackbar]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleBook = async () => {
        if (!trip?.id) return;
        try {
            await tripService.createBooking(trip.id, 1);
            enqueueSnackbar('Rezerwacja została utworzona! Kierowca otrzyma powiadomienie.', { variant: 'success' });
            const updatedTrip = await tripService.getTrip(trip.id);
            setTrip(updatedTrip);
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Nie udało się utworzyć rezerwacji.';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!trip) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography>Przejazd nie został znaleziony.</Typography>
            </Box>
        );
    }

    const { driver_profile, driver_username } = trip;
    const driverName = driver_profile?.first_name
        ? `${driver_profile.first_name} ${driver_profile.last_name || ''}`
        : driver_username || 'Nieznany kierowca';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#e0e0e0', mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#000', cursor: 'pointer', ml: 4 }} onClick={() => navigate('/')}>Sheero</Typography>
                <Box sx={{ display: 'flex', gap: 2, mr: 4 }}>
                    <Button color="inherit" onClick={() => navigate(-1)} startIcon={<ArrowBack />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Wróć</Button>
                    <Button color="inherit" onClick={handleLogout} startIcon={<Logout />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Wyloguj</Button>
                </Box>
            </Box>

            <Container maxWidth="lg" sx={{ pb: 8 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                    <Box sx={{ width: { xs: '100%', md: '65%' } }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '40px', bgcolor: '#f5f5f5', mb: 4 }}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>{trip.date}</Typography>
                            <Box sx={{ mt: 4 }}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Typography variant="h6" fontWeight="bold">{trip.time.substring(0, 5)}</Typography>
                                        <Box sx={{ width: 2, height: '100%', bgcolor: '#bdbdbd', my: 1 }} />
                                    </Box>
                                    <Box sx={{ pb: 3 }}>
                                        <Typography variant="h6" fontWeight="bold">{trip.start_location}</Typography>
                                        <Typography variant="body2" color="textSecondary">Miejsce zbiórki: Centrum</Typography>
                                    </Box>
                                </Box>
                                {trip.intermediate_stops && trip.intermediate_stops.map((stop, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#bdbdbd', my: 1 }} />
                                            <Box sx={{ width: 2, height: '100%', bgcolor: '#bdbdbd', my: 1 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body1">{stop}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Typography variant="body1" color="textSecondary" sx={{ visibility: 'hidden' }}>00:00</Typography>
                                        <Place color="error" />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">{trip.end_location}</Typography>
                                        <Typography variant="body2" color="textSecondary">Miejsce docelowe</Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Divider sx={{ my: 4 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h5" fontWeight="bold">Do zapłaty dla kierowcy</Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary">{trip.price_per_seat} zł</Typography>
                            </Box>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '40px', bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Udogodnienia i zasady</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                                <Chip icon={<SmokingRooms />} label="Zakaz palenia" variant="outlined" />
                                <Chip icon={<Pets />} label="Zwierzęta w klatce" variant="outlined" />
                                <Chip icon={<MusicNote />} label="Muzyka: Rock" variant="outlined" />
                                <Chip icon={<DirectionsCar />} label="Maks. 2 osoby" variant="outlined" />
                            </Stack>
                            <Typography variant="body1" sx={{ mt: 3, color: '#757575', lineHeight: 1.8 }}>Jadę bezpośrednio, bez zbędnych postojów. Proszę o punktualność. Mam miejsce na średni bagaż.</Typography>
                        </Paper>
                    </Box>
                    <Box sx={{ width: { xs: '100%', md: '35%' } }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '40px', border: '1px solid #eee', position: 'sticky', top: 20 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>Twój kierowca</Typography>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <Avatar src={driver_profile?.avatar || undefined} sx={{ width: 64, height: 64, bgcolor: '#c62828', fontSize: '24px' }}>
                                    {driverName[0]?.toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">{driverName}</Typography>
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <Star fontSize="small" sx={{ color: '#FFD700' }} />
                                        <Typography variant="body2" fontWeight="bold">4.8</Typography>
                                        <Typography variant="caption" color="textSecondary">/ 5 (12 opinii)</Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>Doświadczony kierowca, jeżdżę tą trasą regularnie. Lubię rozmawiać, ale szanuję też ciszę.</Typography>
                            <Button variant="contained" fullWidth size="large" onClick={handleBook} disabled={trip.available_seats === 0} sx={{ borderRadius: '30px', bgcolor: '#c62828', py: 1.5, textTransform: 'none', fontSize: '1.1rem', fontWeight: 'bold', '&:hover': { bgcolor: '#b71c1c' } }}>{trip.available_seats > 0 ? 'Rezerwuj miejsce' : 'Brak miejsc'}</Button>
                            <Box mt={2} textAlign="center"><Typography variant="caption" color="textSecondary">Brak opłat rezerwacyjnych online</Typography></Box>
                        </Paper>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
};
