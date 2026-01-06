import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Stack,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Event,
  AccessTime,
  LocationOn,
  Person,
  Cancel,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { bookingService, tripService, Booking } from '../services/api';

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'accepted' | 'reserved' | 'cancelled'>('all');

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const data = await bookingService.getMyBookings(status);
      console.log('Loaded bookings:', data); // Debug
      setBookings(data);
    } catch (error: any) {
      console.error('Error loading bookings:', error); // Debug
      const errorMessage = error.response?.data?.detail || error.message || 'Błąd pobierania rezerwacji';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (!booking.trip_details?.id) return;
    if (!window.confirm('Czy na pewno anulować tę rezerwację?')) return;

    try {
      await tripService.cancelBooking(booking.trip_details.id, booking.id);
      enqueueSnackbar('Rezerwacja anulowana', { variant: 'info' });
      loadBookings();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Nie udało się anulować rezerwacji.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'reserved':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Zaakceptowane';
      case 'reserved':
        return 'Oczekujące';
      case 'cancelled':
        return 'Anulowane';
      default:
        return status;
    }
  };

  const isUpcoming = (tripDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const trip = new Date(tripDate);
    trip.setHours(0, 0, 0, 0);
    return trip >= today;
  };

  const upcomingBookings = bookings.filter(b => 
    b.status === 'accepted' && b.trip_details && isUpcoming(b.trip_details.date)
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ bgcolor: 'white' }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Moje Rezerwacje
          </Typography>
        </Box>

        {/* Nadchodzące przejazdy */}
        {upcomingBookings.length > 0 && (
          <Alert 
            severity="info" 
            icon={<Event />}
            sx={{ mb: 3, borderRadius: '20px', bgcolor: '#e3f2fd' }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Nadchodzące przejazdy ({upcomingBookings.length})
            </Typography>
            <Typography variant="body2">
              Masz {upcomingBookings.length} {upcomingBookings.length === 1 ? 'zaakceptowaną rezerwację' : 'zaakceptowane rezerwacje'} na najbliższe dni.
            </Typography>
          </Alert>
        )}

        {/* Filtry */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilter('all')}
            sx={{ borderRadius: '20px' }}
          >
            Wszystkie
          </Button>
          <Button
            variant={filter === 'accepted' ? 'contained' : 'outlined'}
            onClick={() => setFilter('accepted')}
            color="success"
            sx={{ borderRadius: '20px' }}
          >
            Zaakceptowane
          </Button>
          <Button
            variant={filter === 'reserved' ? 'contained' : 'outlined'}
            onClick={() => setFilter('reserved')}
            color="warning"
            sx={{ borderRadius: '20px' }}
          >
            Oczekujące
          </Button>
          <Button
            variant={filter === 'cancelled' ? 'contained' : 'outlined'}
            onClick={() => setFilter('cancelled')}
            color="error"
            sx={{ borderRadius: '20px' }}
          >
            Anulowane
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : bookings.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '30px' }}>
            <Typography variant="h6" color="textSecondary">
              Brak rezerwacji
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {bookings.map((booking) => {
              const trip = booking.trip_details;
              if (!trip) return null;

              const tripDate = new Date(trip.date);
              const isUpcomingTrip = isUpcoming(trip.date);
              const totalPrice = parseFloat(trip.price_per_seat) * booking.seats;

              return (
                <Paper
                  key={booking.id}
                  sx={{
                    p: 3,
                    borderRadius: '25px',
                    border: isUpcomingTrip && booking.status === 'accepted' ? '2px solid #4caf50' : '1px solid #e0e0e0',
                    bgcolor: isUpcomingTrip && booking.status === 'accepted' ? '#f1f8f4' : 'white',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={getStatusLabel(booking.status)}
                          color={getStatusColor(booking.status) as any}
                          icon={booking.status === 'accepted' ? <CheckCircle /> : booking.status === 'reserved' ? <Schedule /> : <Cancel />}
                          sx={{ fontWeight: 'bold' }}
                        />
                        {isUpcomingTrip && booking.status === 'accepted' && (
                          <Chip
                            label="Nadchodzący"
                            color="info"
                            size="small"
                            icon={<Event />}
                          />
                        )}
                      </Box>

                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {trip.start_location} → {trip.end_location}
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Event color="action" fontSize="small" />
                          <Typography variant="body2" color="textSecondary">
                            {tripDate.toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </Typography>
                        </Box>
                        {trip.time && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime color="action" fontSize="small" />
                            <Typography variant="body2" color="textSecondary">
                              {trip.time}
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person color="action" fontSize="small" />
                          <Typography variant="body2" color="textSecondary">
                            {booking.seats} {booking.seats === 1 ? 'miejsce' : 'miejsc'} • {totalPrice.toFixed(2)} zł
                          </Typography>
                        </Box>
                        {trip.driver_profile && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Avatar
                              src={trip.driver_profile.avatar || undefined}
                              sx={{ width: 24, height: 24 }}
                            >
                              {trip.driver_username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" color="textSecondary">
                              Kierowca: {trip.driver_profile.first_name && trip.driver_profile.last_name
                                ? `${trip.driver_profile.first_name} ${trip.driver_profile.last_name}`
                                : trip.driver_username}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/trip/${trip.id}`)}
                      sx={{ borderRadius: '20px' }}
                    >
                      Szczegóły
                    </Button>
                    {booking.status !== 'cancelled' && booking.status !== 'accepted' && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleCancelBooking(booking)}
                        sx={{ borderRadius: '20px' }}
                      >
                        Anuluj
                      </Button>
                    )}
                    {booking.status === 'accepted' && isUpcomingTrip && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleCancelBooking(booking)}
                        sx={{ borderRadius: '20px' }}
                      >
                        Anuluj rezerwację
                      </Button>
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default MyBookings;

