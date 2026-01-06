import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  People,
  Refresh,
  ArrowForward,
  Logout,
  ArrowBack,
  Check,
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Booking, Trip, TripFormData, tripService, authService } from '../services/api';

const validationSchema = yup.object({
  start_location: yup.string().required('Wymagane'),
  end_location: yup.string().required('Wymagane'),
  date: yup.string().required('Wymagane'),
  time: yup.string().required('Wymagane'),
  available_seats: yup.number().required('Wymagane'),
  price_per_seat: yup.number().required('Wymagane'),
});

export const MyTrips: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [editStops, setEditStops] = useState<string[]>([]);
  const [newStop, setNewStop] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passengersDialogOpen, setPassengersDialogOpen] = useState(false);
  const [passengers, setPassengers] = useState<Booking[]>([]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await tripService.getMyTrips();
      console.log('Loaded trips:', data); // Debug
      setTrips(data);
    } catch (error: any) {
      console.error('Error loading trips:', error); // Debug
      console.error('Error response:', error.response); // Debug
      const errorMessage = error.response?.data?.detail || error.message || 'Nie udało się pobrać przejazdów.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleOpenEdit = (trip: Trip) => {
    setSelectedTrip(trip);
    setEditStops(trip.intermediate_stops || []);
    setEditDialogOpen(true);
  };

  const handleShowPassengers = async (trip: Trip) => {
    setSelectedTrip(trip);
    setPassengersDialogOpen(true);
    try {
      const data = await tripService.getPassengers(trip.id!);
      setPassengers(data);
    } catch (error) {
      enqueueSnackbar('Błąd pobierania pasażerów', { variant: 'error' });
    }
  };

  const handleAcceptBooking = async (booking: Booking) => {
    if (!selectedTrip?.id) return;
    try {
      await tripService.acceptBooking(selectedTrip.id, booking.id);
      enqueueSnackbar('Rezerwacja zaakceptowana!', { variant: 'success' });
      // Odśwież listę pasażerów
      const data = await tripService.getPassengers(selectedTrip.id);
      setPassengers(data);
      // Odśwież listę przejazdów
      loadTrips();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Nie udało się zaakceptować rezerwacji.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleRejectBooking = async (booking: Booking) => {
    if (!selectedTrip?.id) return;
    if (!window.confirm(`Czy na pewno odrzucić rezerwację od ${booking.passenger_username}?`)) return;
    try {
      await tripService.rejectBooking(selectedTrip.id, booking.id);
      enqueueSnackbar('Rezerwacja odrzucona.', { variant: 'info' });
      // Odśwież listę pasażerów
      const data = await tripService.getPassengers(selectedTrip.id);
      setPassengers(data);
      // Odśwież listę przejazdów
      loadTrips();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Nie udało się odrzucić rezerwacji.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleCompleteTrip = async (tripId: number) => {
    if (!window.confirm('Czy na pewno zakończyć ten przejazd? Środki zostaną wypłacone do portfela kierowcy (z prowizją 5%).')) return;

    try {
      const result = await tripService.completeTrip(tripId);
      enqueueSnackbar(result.detail || 'Przejazd zakończony. Środki wypłacone do portfela.', { variant: 'success' });
      loadTrips();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Nie udało się zakończyć przejazdu.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleCancelTrip = async (trip: Trip) => {
    if (window.confirm("Czy na pewno anulować?")) {
      try {
        await tripService.cancelTrip(trip.id!);
        enqueueSnackbar('Anulowano', { variant: 'info' });
        loadTrips();
      } catch (e) { enqueueSnackbar('Błąd', { variant: 'error' }); }
    }
  };

  const formik = useFormik<TripFormData>({
    enableReinitialize: true,
    initialValues: selectedTrip
      ? {
        start_location: selectedTrip.start_location,
        end_location: selectedTrip.end_location,
        intermediate_stops: selectedTrip.intermediate_stops || [],
        date: selectedTrip.date,
        time: selectedTrip.time,
        available_seats: selectedTrip.available_seats,
        price_per_seat: Number(selectedTrip.price_per_seat),
      }
      : { start_location: '', end_location: '', intermediate_stops: [], date: '', time: '', available_seats: 1, price_per_seat: 0 },
    validationSchema,
    onSubmit: async (values) => {
      if (!selectedTrip?.id) return;
      try {
        await tripService.updateTrip(selectedTrip.id, { ...values, intermediate_stops: editStops });
        enqueueSnackbar('Zaktualizowano', { variant: 'success' });
        loadTrips();
        setEditDialogOpen(false);
      } catch (e) { enqueueSnackbar('Błąd aktualizacji', { variant: 'error' }); }
    },
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#e0e0e0', mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 'bold', color: '#000', cursor: 'pointer', ml: 4 }}
          onClick={() => navigate('/')}
        >
          Sheero
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mr: 4 }}>
          <Button color="inherit" onClick={() => navigate('/driver')} startIcon={<ArrowBack />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            Wróć
          </Button>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            Wyloguj
          </Button>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ flexGrow: 1, pb: 8 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Moje przejazdy</Typography>
          <Button
            variant="contained" startIcon={<Add />} onClick={() => navigate('/trips/add')}
            sx={{ bgcolor: '#c62828', borderRadius: '30px', px: 3, textTransform: 'none', fontWeight: 'bold', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            Dodaj przejazd
          </Button>
        </Stack>

        {loading ? (
          <Box display='flex' justifyContent='center'><CircularProgress /></Box>
        ) : trips.length === 0 ? (
          <Paper elevation={0} sx={{ bgcolor: '#f5f5f5', p: 6, borderRadius: '30px', textAlign: 'center' }}>
            <Typography color="textSecondary">Nie masz jeszcze żadnych przejazdów.</Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {trips.map(trip => (
              <Paper key={trip.id} elevation={0} sx={{ p: 3, borderRadius: '30px', border: '1px solid #eee', bgcolor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  {/* Route & Time */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="h5" fontWeight="bold">{trip.start_location}</Typography>
                      <ArrowForward color="action" />
                      <Typography variant="h5" fontWeight="bold">{trip.end_location}</Typography>
                    </Box>
                    <Typography variant="body1" color="textSecondary">{trip.date} • {trip.time.substring(0, 5)}</Typography>
                  </Box>
                  {/* Price */}
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">{trip.price_per_seat} zł</Typography>
                    <Typography variant="caption" color="textSecondary">za osobę</Typography>
                  </Box>
                </Box>

                {/* Intermediate Stops */}
                {trip.intermediate_stops && trip.intermediate_stops.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    {trip.intermediate_stops.map((stop, i) => (
                      <Chip key={i} label={stop} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}

                <Divider sx={{ mb: 2 }} />

                {/* Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    startIcon={<People />}
                    onClick={() => handleShowPassengers(trip)}
                    sx={{ color: '#000', textTransform: 'none', background: '#f5f5f5', borderRadius: '20px', px: 2, '&:hover': { background: '#eee' } }}
                  >
                    Pasażerowie ({trip.bookings?.length || 0})
                  </Button>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {(() => {
                      const tripDate = new Date(trip.date);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isPastOrToday = tripDate <= today;
                      const hasPaidBookings = trip.bookings?.some((b: Booking) => b.status === 'paid') || false;
                      
                      return isPastOrToday && hasPaidBookings ? (
                        <Button
                          startIcon={<Check />}
                          onClick={() => handleCompleteTrip(trip.id!)}
                          sx={{ color: '#4caf50', textTransform: 'none', borderRadius: '20px', px: 2, border: '1px solid #4caf50', '&:hover': { background: '#f1f8f4' } }}
                        >
                          Zakończ przejazd
                        </Button>
                      ) : null;
                    })()}
                    <IconButton onClick={() => handleOpenEdit(trip)} color="primary" sx={{ bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleCancelTrip(trip)} color="error" sx={{ bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '30px', p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Edytuj przejazd</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>Edycja trasy: {selectedTrip?.start_location} - {selectedTrip?.end_location}</Typography>
          <Box component="form" sx={{ pt: 1 }}>
            <Stack spacing={2}>
              <TextField label="Data" type="date" name="date" value={formik.values.date} onChange={formik.handleChange} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Godzina" type="time" name="time" value={formik.values.time} onChange={formik.handleChange} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Miejsca" type="number" name="available_seats" value={formik.values.available_seats} onChange={formik.handleChange} fullWidth />
              <TextField label="Cena" type="number" name="price_per_seat" value={formik.values.price_per_seat} onChange={formik.handleChange} fullWidth />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ borderRadius: '20px', color: '#757575' }}>Anuluj</Button>
          <Button onClick={() => formik.handleSubmit()} variant="contained" sx={{ borderRadius: '20px', bgcolor: '#c62828', '&:hover': { bgcolor: '#b71c1c' } }}>Zapisz</Button>
        </DialogActions>
      </Dialog>

      {/* Passengers Dialog */}
      <Dialog open={passengersDialogOpen} onClose={() => setPassengersDialogOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '30px' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Lista pasażerów</DialogTitle>
        <DialogContent>
          {passengers.length === 0 ? (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>Brak rezerwacji</Typography>
          ) : (
            <List>
              {passengers.map(p => (
                <ListItem
                  key={p.id}
                  divider
                  sx={{
                    bgcolor: p.status === 'accepted' ? '#e8f5e9' : p.status === 'reserved' ? '#fff3e0' : '#ffebee',
                    borderRadius: '15px',
                    mb: 1,
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="bold">{p.passenger_username}</Typography>
                        <Chip
                          label={
                            p.status === 'accepted' ? 'Zaakceptowane' :
                            p.status === 'reserved' ? 'Oczekujące' :
                            'Anulowane'
                          }
                          size="small"
                          color={
                            p.status === 'accepted' ? 'success' :
                            p.status === 'reserved' ? 'warning' :
                            'error'
                          }
                        />
                      </Box>
                    }
                    secondary={`${p.seats} ${p.seats === 1 ? 'miejsce' : 'miejsc'}`}
                  />
                  {p.status === 'reserved' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleAcceptBooking(p)}
                        color="success"
                        sx={{ bgcolor: '#e8f5e9', '&:hover': { bgcolor: '#c8e6c9' } }}
                        title="Zaakceptuj"
                      >
                        <Check />
                      </IconButton>
                      <IconButton
                        onClick={() => handleRejectBooking(p)}
                        color="error"
                        sx={{ bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}
                        title="Odrzuć"
                      >
                        <Close />
                      </IconButton>
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPassengersDialogOpen(false)} sx={{ borderRadius: '20px' }}>Zamknij</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
