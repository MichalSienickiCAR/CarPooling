import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Container, Divider, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { ArrowForward, Logout, ArrowBack, DirectionsCar, PersonOutline, CheckCircle, Cancel, EventAvailable } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Booking, Trip, tripService, bookingService, authService } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const History: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userRole, setUserRole] = useState<'driver' | 'passenger'>('driver');

  useEffect(() => {
    const role = localStorage.getItem('userRole') as 'driver' | 'passenger';
    setUserRole(role || 'driver');
    loadHistory(role || 'driver');
  }, []);

  const loadHistory = async (role: 'driver' | 'passenger') => {
    setLoading(true);
    try {
      if (role === 'driver') {
        const tripData = await tripService.getTripHistory();
        setTrips(tripData);
      } else {
        const bookingData = await bookingService.getBookingHistory();
        setBookings(bookingData);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Nie udało się pobrać historii.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getStatusChip = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: 'success' | 'error' | 'warning' | 'info' | 'default' } } = {
      paid: { label: 'Opłacone', color: 'success' },
      accepted: { label: 'Zaakceptowane', color: 'info' },
      reserved: { label: 'Zarezerwowane', color: 'warning' },
      cancelled: { label: 'Anulowane', color: 'error' },
    };
    return statusMap[status] || { label: status, color: 'default' };
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
          onClick={() => navigate(userRole === 'driver' ? '/driver' : '/passenger')}
        >
          Sheero
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
          <Button 
            color="inherit" 
            onClick={() => navigate(userRole === 'driver' ? '/driver' : '/passenger')} 
            startIcon={<ArrowBack />} 
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              color: '#333',
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
              color: '#333',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            Wyloguj
          </Button>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ flexGrow: 1, pb: 8, pt: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid #e0e0e0', bgcolor: '#fff', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Historia Przejazdów
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Przeglądaj swoje zakończone przejazdy {userRole === 'driver' ? 'jako kierowca' : 'jako pasażer'}
          </Typography>
        </Paper>

        {loading ? (
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='300px'>
            <CircularProgress />
          </Box>
        ) : userRole === 'driver' ? (
          // Historia kierowcy
          trips.length === 0 ? (
            <Paper elevation={0} sx={{ bgcolor: '#ffffff', p: 6, borderRadius: '16px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
              <DirectionsCar sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">Brak zakończonych przejazdów</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Twoje zakończone przejazdy będą wyświetlane tutaj
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={3}>
              {trips.map(trip => (
                <Paper key={trip.id} elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e0e0e0', bgcolor: '#fff', transition: 'all 0.3s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h5" fontWeight="bold">{trip.start_location}</Typography>
                        <ArrowForward color="action" />
                        <Typography variant="h5" fontWeight="bold">{trip.end_location}</Typography>
                        <Chip 
                          icon={<CheckCircle />} 
                          label="Zakończony" 
                          color="success" 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="body1" color="textSecondary">
                          <strong>Data:</strong> {trip.date} • {trip.time.substring(0, 5)}
                        </Typography>
                        {trip.completed_at && (
                          <Typography variant="body2" color="textSecondary">
                            <strong>Zakończono:</strong> {new Date(trip.completed_at).toLocaleString('pl-PL')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h4" fontWeight="bold" color="primary">{trip.price_per_seat} zł</Typography>
                      <Typography variant="caption" color="textSecondary">za miejsce</Typography>
                    </Box>
                  </Box>
                  
                  {trip.intermediate_stops && trip.intermediate_stops.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      {trip.intermediate_stops.map((stop, i) => (
                        <Chip key={i} label={stop} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Miejsca:</strong> {trip.available_seats}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Pasażerowie:</strong> {trip.bookings?.length || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )
        ) : (
          // Historia pasażera
          bookings.length === 0 ? (
            <Paper elevation={0} sx={{ bgcolor: '#ffffff', p: 6, borderRadius: '16px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
              <PersonOutline sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">Brak zakończonych przejazdów</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Twoje zakończone rezerwacje będą wyświetlane tutaj
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={3}>
              {bookings.map(booking => (
                <Paper key={booking.id} elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e0e0e0', bgcolor: '#fff', transition: 'all 0.3s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h5" fontWeight="bold">{booking.trip_start_location}</Typography>
                        <ArrowForward color="action" />
                        <Typography variant="h5" fontWeight="bold">{booking.trip_end_location}</Typography>
                        <Chip 
                          label={getStatusChip(booking.status).label}
                          color={getStatusChip(booking.status).color}
                          size="small" 
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="body1" color="textSecondary">
                          <strong>Data:</strong> {booking.trip_date} • {booking.trip_time?.substring(0, 5)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Kierowca:</strong> {booking.driver_username}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        {booking.trip_price_per_seat ? (
                          ((typeof booking.trip_price_per_seat === 'string' ? parseFloat(booking.trip_price_per_seat) : booking.trip_price_per_seat) * booking.seats).toFixed(2)
                        ) : '0.00'} zł
                      </Typography>
                      <Typography variant="caption" color="textSecondary">{booking.seats} {booking.seats === 1 ? 'miejsce' : 'miejsc'}</Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Zarezerwowano:</strong> {new Date(booking.created_at).toLocaleString('pl-PL')}
                    </Typography>
                    {booking.paid_at && (
                      <Typography variant="body2" color="success.main">
                        <strong>Opłacono:</strong> {new Date(booking.paid_at).toLocaleString('pl-PL')}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              ))}
            </Stack>
          )
        )}
      </Container>
    </Box>
  );
};
