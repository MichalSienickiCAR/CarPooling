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
import { ArrowBack, Logout, Place, DirectionsCar, Star, SmokingRooms, Pets, MusicNote, FavoriteBorder, Favorite, Report, Luggage } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { tripService, authService, Trip, trustedUserService } from '../services/api';
import { formatDateRelative, formatDuration } from '../utils/formatUtils';
import ReportUser from './ReportUser';
import WaitlistDialog from './WaitlistDialog';
import WeatherForecast from './WeatherForecast';

export const TripDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [isTrusted, setIsTrusted] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [openWaitlistDialog, setOpenWaitlistDialog] = useState(false);

    useEffect(() => {
        const fetchTrip = async () => {
            if (!id) return;
            try {
                const data = await tripService.getTrip(id);
                setTrip(data);
                // Sprawdź czy kierowca jest zaufany
                if (data.driver) {
                    const trusted = await trustedUserService.checkTrusted(data.driver);
                    setIsTrusted(trusted);
                }
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

    const handleToggleTrusted = async () => {
        if (!trip?.driver) return;
        try {
            if (isTrusted) {
                enqueueSnackbar('Aby usunąć użytkownika z zaufanych, przejdź do listy zaufanych użytkowników', { variant: 'info' });
            } else {
                await trustedUserService.addTrustedUser(trip.driver, Number(id));
                setIsTrusted(true);
                enqueueSnackbar('Użytkownik dodany do zaufanych!', { variant: 'success' });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Wystąpił błąd';
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
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', mb: 4 }}>
                <Typography 
                    variant="h5" 
                    sx={{ 
                        fontWeight: 'bold', 
                            color: 'text.primary', 
                        cursor: 'pointer', 
                        ml: 4 
                    }} 
                    onClick={() => {
                        const isAuthenticated = !!localStorage.getItem('token');
                        navigate(isAuthenticated ? '/dashboard' : '/');
                    }}
                >
                    Sheero
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mr: 4 }}>
                    <Button color="inherit" onClick={() => navigate(-1)} startIcon={<ArrowBack />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Wróć</Button>
                    <Button color="inherit" onClick={handleLogout} startIcon={<Logout />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>Wyloguj</Button>
                </Box>
            </Box>

            <Container maxWidth="lg" sx={{ pb: 8 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                    <Box sx={{ width: { xs: '100%', md: '65%' } }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '40px', bgcolor: 'background.paper', mb: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                              <Typography variant="h4" fontWeight="bold">{formatDateRelative(trip.date)}</Typography>
                              <Typography variant="body1" color="textSecondary">{trip.date}</Typography>
                              {trip.available_seats === 1 && (
                                <Chip label="Ostatnie miejsce!" size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }} />
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                              {trip.estimated_duration_minutes != null && (
                                <Typography variant="body2" color="textSecondary">{formatDuration(trip.estimated_duration_minutes)}</Typography>
                              )}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Luggage sx={{ fontSize: '18px', color: trip.luggage_ok !== false ? '#00aff5' : '#9e9e9e' }} />
                                <Typography variant="body2" color="textSecondary">{trip.luggage_ok !== false ? 'Miejsce na bagaż' : 'Brak miejsca na bagaż'}</Typography>
                              </Box>
                            </Box>
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
                        {/* Mapa trasy – wyłączona, do zrobienia od nowa */}
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '40px', bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider', mb: 4 }}>
                            <Typography variant="body2" color="text.secondary" textAlign="center">Mapa trasy – wkrótce</Typography>
                        </Paper>
                        {trip && trip.id && <WeatherForecast tripId={trip.id} />}
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '40px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Udogodnienia i zasady</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                                <Chip icon={<SmokingRooms />} label="Zakaz palenia" variant="outlined" />
                                <Chip icon={<Pets />} label="Zwierzęta w klatce" variant="outlined" />
                                <Chip icon={<MusicNote />} label="Muzyka: Rock" variant="outlined" />
                                <Chip icon={<DirectionsCar />} label="Maks. 2 osoby" variant="outlined" />
                            </Stack>
                            <Typography variant="body1" sx={{ mt: 3, color: 'text.secondary', lineHeight: 1.8 }}>Jadę bezpośrednio, bez zbędnych postojów. Proszę o punktualność. Mam miejsce na średni bagaż.</Typography>
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
                            <Stack spacing={2}>
                                <Button 
                                    variant="contained" 
                                    fullWidth 
                                    size="large" 
                                    onClick={handleBook} 
                                    disabled={trip.available_seats === 0} 
                                    sx={{ 
                                        borderRadius: '30px', 
                                        bgcolor: '#c62828', 
                                        py: 1.5, 
                                        textTransform: 'none', 
                                        fontSize: '1.1rem', 
                                        fontWeight: 'bold', 
                                        '&:hover': { bgcolor: '#b71c1c' } 
                                    }}
                                >
                                    {trip.available_seats > 0 ? 'Rezerwuj miejsce' : 'Brak miejsc'}
                                </Button>
                                {trip.available_seats === 0 && (
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        size="large"
                                        onClick={() => setOpenWaitlistDialog(true)}
                                        sx={{
                                            borderRadius: '30px',
                                            py: 1.5,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        Zapisz się na listę oczekujących
                                    </Button>
                                )}
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={isTrusted ? <Favorite /> : <FavoriteBorder />}
                                        onClick={handleToggleTrusted}
                                        sx={{
                                            borderRadius: '30px',
                                            textTransform: 'none',
                                            borderColor: isTrusted ? '#c62828' : '#ccc',
                                            color: isTrusted ? '#c62828' : '#666',
                                            '&:hover': {
                                                borderColor: '#c62828',
                                                bgcolor: 'rgba(198, 40, 40, 0.04)'
                                            }
                                        }}
                                    >
                                        {isTrusted ? 'Zaufany' : 'Dodaj do zaufanych'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Report />}
                                        onClick={() => setShowReportModal(true)}
                                        sx={{
                                            borderRadius: '30px',
                                            textTransform: 'none',
                                            borderColor: '#ccc',
                                            color: '#666',
                                            minWidth: 'fit-content',
                                            px: 2,
                                            '&:hover': {
                                                borderColor: '#f44336',
                                                color: '#f44336',
                                                bgcolor: 'rgba(244, 67, 54, 0.04)'
                                            }
                                        }}
                                    >
                                        Zgłoś
                                    </Button>
                                </Stack>
                            </Stack>
                            <Box mt={2} textAlign="center"><Typography variant="caption" color="textSecondary">Brak opłat rezerwacyjnych online</Typography></Box>
                        </Paper>
                    </Box>
                </Stack>
            </Container>
            
            {showReportModal && trip?.driver && (
                <ReportUser
                    reportedUserId={trip.driver}
                    reportedUsername={driver_username || 'Kierowca'}
                    tripId={Number(id)}
                    onClose={() => setShowReportModal(false)}
                    onSuccess={() => {
                        enqueueSnackbar('Zgłoszenie zostało wysłane', { variant: 'success' });
                    }}
                />
            )}

            {trip && trip.id && (
                <WaitlistDialog
                    open={openWaitlistDialog}
                    tripId={trip.id}
                    maxSeats={trip.available_seats}
                    onClose={() => setOpenWaitlistDialog(false)}
                    onSuccess={() => {
                        enqueueSnackbar('Zapisano na listę oczekujących', { variant: 'success' });
                    }}
                />
            )}
        </Box>
    );
};
