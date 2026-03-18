import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Stack, Chip, Button, CircularProgress, Alert, Avatar, Divider, IconButton } from '@mui/material';
import { ArrowBack, Event, AccessTime, Person, Cancel, CheckCircle, Schedule, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { bookingService, tripService, Booking, authService } from '../services/api';
import { Payment, Warning } from '@mui/icons-material';

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
      setBookings(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Błąd pobierania rezerwacji';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeUntilPaymentDeadline = (tripDate: string, tripTime?: string): { hours: number; canPay: boolean; message: string } => {
    const date = new Date(tripDate);
    if (tripTime) {
      const [hours, minutes] = tripTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 0) {
      return { hours: 0, canPay: false, message: 'Przejazd już się odbył' };
    } else if (diffHours < 10) {
      const hoursLeft = Math.floor(diffHours);
      const minutesLeft = Math.floor((diffHours - hoursLeft) * 60);
      return { hours: diffHours, canPay: false, message: `Za późno na płatność (min. 10h przed). Pozostało: ${hoursLeft}h ${minutesLeft}min` };
    } else {
      const hoursLeft = Math.floor(diffHours - 10);
      const minutesLeft = Math.floor(((diffHours - 10) - hoursLeft) * 60);
      return { hours: diffHours, canPay: true, message: `Płatność możliwa do: ${hoursLeft}h ${minutesLeft}min przed przejazdem` };
    }
  };

  const handlePay = async (booking: Booking) => {
    if (!booking.trip_details) return;
    try {
      await tripService.payBooking(booking.trip_details.id, booking.id);
      enqueueSnackbar('Płatność zakończona pomyślnie!', { variant: 'success' });
      loadBookings();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.detail || 'Błąd podczas płatności', { variant: 'error' });
    }
  };

  const getRefundPreview = (tripDate: string, tripTime: string | undefined, total: number) => {
    const date = new Date(tripDate);
    if (tripTime) {
      const [h, m] = tripTime.split(':').map(Number);
      date.setHours(h, m, 0, 0);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 0) {
      return { percent: 0, driverPercent: 0, message: 'Po odjeździe: brak zwrotu (no-show).' };
    }
    if (diffHours >= 10) {
      return { percent: 100, driverPercent: 0, message: 'Anulowanie ≥ 10h przed: zwrot 100% do portfela.' };
    }
    return { percent: 20, driverPercent: 20, message: 'Anulowanie < 10h przed: zwrot 20%, kierowca 20%, platforma 60%.' };
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (!booking.trip_details?.id) return;
    const trip = booking.trip_details;
    const totalPrice = parseFloat(trip.price_per_seat) * booking.seats;
    const refundInfo = getRefundPreview(trip.date, trip.time || undefined, totalPrice);
    const confirmText =
      booking.status === 'paid'
        ? `Czy na pewno anulować tę rezerwację?\n\n${refundInfo.message}`
        : 'Czy na pewno anulować tę rezerwację?';
    if (!window.confirm(confirmText)) return;
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

  const upcomingBookings = bookings.filter(b => b.status === 'accepted' && b.trip_details && isUpcoming(b.trip_details.date));

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        bgcolor: 'background.paper',
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
        <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
          <Button 
            color="inherit" 
            onClick={() => navigate('/passenger')} 
            startIcon={<ArrowBack />} 
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              color: 'text.primary',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            Wróć
          </Button>
          <Button 
            color="inherit" 
            onClick={handleLogout} 
            startIcon={<Logout />} 
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              color: 'text.primary',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            Wyloguj
          </Button>
        </Box>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} color="#1a1a1a">Moje Rezerwacje</Typography>
        </Box>
        {upcomingBookings.length > 0 && (
          <Alert severity="info" icon={<Event />} sx={{ mb: 3, borderRadius: '12px', bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Nadchodzące przejazdy ({upcomingBookings.length})</Typography>
            <Typography variant="body2">Masz {upcomingBookings.length} {upcomingBookings.length === 1 ? 'zaakceptowaną rezerwację' : 'zaakceptowane rezerwacje'} na najbliższe dni.</Typography>
          </Alert>
        )}
        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant={filter === 'all' ? 'contained' : 'outlined'} onClick={() => setFilter('all')} sx={{ borderRadius: '20px' }}>Wszystkie</Button>
          <Button variant={filter === 'accepted' ? 'contained' : 'outlined'} onClick={() => setFilter('accepted')} color="success" sx={{ borderRadius: '20px' }}>Zaakceptowane</Button>
          <Button variant={filter === 'reserved' ? 'contained' : 'outlined'} onClick={() => setFilter('reserved')} color="warning" sx={{ borderRadius: '20px' }}>Oczekujące</Button>
          <Button variant={filter === 'cancelled' ? 'contained' : 'outlined'} onClick={() => setFilter('cancelled')} color="error" sx={{ borderRadius: '20px' }}>Anulowane</Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : bookings.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '30px' }}><Typography variant="h6" color="textSecondary">Brak rezerwacji</Typography></Paper>
        ) : (
          <Stack spacing={2}>
            {bookings.map((booking) => {
              const trip = booking.trip_details;
              if (!trip) return null;
              const tripDate = new Date(trip.date);
              const isUpcomingTrip = isUpcoming(trip.date);
              const totalPrice = parseFloat(trip.price_per_seat) * booking.seats;
              return (
                <Paper key={booking.id} sx={{ p: 3, borderRadius: '25px', border: isUpcomingTrip && booking.status === 'accepted' ? '2px solid #4caf50' : '1px solid #e0e0e0', bgcolor: isUpcomingTrip && booking.status === 'accepted' ? '#f1f8f4' : 'white', transition: 'all 0.3s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip label={getStatusLabel(booking.status)} color={getStatusColor(booking.status) as any} icon={booking.status === 'accepted' ? <CheckCircle /> : booking.status === 'reserved' ? <Schedule /> : <Cancel />} sx={{ fontWeight: 'bold' }} />
                        {isUpcomingTrip && booking.status === 'accepted' && <Chip label="Nadchodzący" color="info" size="small" icon={<Event />} />}
                      </Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>{trip.start_location} → {trip.end_location}</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Event color="action" fontSize="small" /><Typography variant="body2" color="textSecondary">{tripDate.toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Typography></Box>
                        {trip.time && (<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AccessTime color="action" fontSize="small" /><Typography variant="body2" color="textSecondary">{trip.time}</Typography></Box>)}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Person color="action" fontSize="small" /><Typography variant="body2" color="textSecondary">{booking.seats} {booking.seats === 1 ? 'miejsce' : 'miejsc'} • {totalPrice.toFixed(2)} zł</Typography></Box>
                        {trip.driver_profile && (<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}><Avatar src={trip.driver_profile.avatar || undefined} sx={{ width: 24, height: 24 }}></Avatar><Typography variant="body2" color="textSecondary">Kierowca: {trip.driver_profile.first_name && trip.driver_profile.last_name ? `${trip.driver_profile.first_name} ${trip.driver_profile.last_name}` : trip.driver_username}</Typography></Box>)}
                      </Box>
                      {(booking.status === 'accepted' || booking.status === 'paid') && booking.trip_details && (
                        <Box sx={{ mt: 2, p: 1.5, bgcolor: booking.status === 'paid' ? '#e8f5e9' : '#fff3e0', borderRadius: 2 }}>
                          {booking.status === 'paid' ? (
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircle color="success" fontSize="small" />
                              <Typography variant="body2" color="success.main" fontWeight="bold">
                                Opłacone {booking.paid_at && new Date(booking.paid_at).toLocaleString('pl-PL')}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {getRefundPreview(trip.date, trip.time || undefined, totalPrice).message}
                            </Typography>
                          </Box>
                          ) : (
                            (() => {
                              const paymentInfo = calculateTimeUntilPaymentDeadline(booking.trip_details.date, booking.trip_details.time || undefined);
                              return (
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><Warning color={paymentInfo.canPay ? 'warning' : 'error'} fontSize="small" /><Typography variant="body2" color={paymentInfo.canPay ? 'warning.main' : 'error.main'} fontWeight="bold">{paymentInfo.message}</Typography></Box>
                                  {paymentInfo.canPay && (<Button variant="contained" color="primary" size="small" startIcon={<Payment />} onClick={() => handlePay(booking)} sx={{ mt: 1 }}>Zapłać {totalPrice.toFixed(2)} zł</Button>)}
                                </Box>
                              );
                            })()
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={() => navigate(`/trips/${trip.id}`)} sx={{ borderRadius: '20px' }}>Szczegóły</Button>
                    {booking.status !== 'cancelled' && (
                      <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => handleCancelBooking(booking)} sx={{ borderRadius: '20px' }}>Anuluj</Button>
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
