import React, { useEffect, useState } from 'react';
import { AppBar, Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Checkbox, IconButton, List, ListItem, ListItemText, Paper, Stack, TextField, Typography } from '@mui/material';
import { Add, Edit, Delete, People, ArrowForward, Logout, ArrowBack, Check, Close, Notifications, CheckCircle } from '@mui/icons-material';
import { formatDateRelative } from '../utils/formatUtils';
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
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await tripService.getMyTrips();
      setTrips(data);
    } catch (error: any) {
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
      const data = await tripService.getPassengers(selectedTrip.id);
      setPassengers(data);
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
      const data = await tripService.getPassengers(selectedTrip.id);
      setPassengers(data);
      loadTrips();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Nie udało się odrzucić rezerwacji.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleOpenNotifyDialog = (trip: Trip) => {
    setSelectedTrip(trip);
    setNotificationMessage('');
    setNotifyDialogOpen(true);
  };

  const handleSendNotification = async () => {
    if (!selectedTrip?.id) return;
    if (!notificationMessage.trim()) {
      enqueueSnackbar('Wiadomość nie może być pusta.', { variant: 'warning' });
      return;
    }
    try {
      const response = await tripService.notifyPassengers(selectedTrip.id, notificationMessage);
      enqueueSnackbar(response.detail || 'Powiadomienie wysłane!', { variant: 'success' });
      setNotifyDialogOpen(false);
      setNotificationMessage('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Nie udało się wysłać powiadomienia.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleCompleteTrip = async (trip: Trip) => {
    if (!trip.id) return;
    const isPastDate = new Date(trip.date) < new Date(new Date().toDateString());
    if (!isPastDate) {
      enqueueSnackbar('Można zakończyć tylko przejazd, który się już odbył.', { variant: 'warning' });
      return;
    }
    if (!window.confirm(`Czy na pewno oznaczyć ten przejazd jako zakończony? Otrzymasz wypłatę za opłacone rezerwacje.`)) return;
    try {
      const response = await tripService.completeTrip(trip.id);
      enqueueSnackbar(response.detail || 'Przejazd zakończony!', { variant: 'success' });
      loadTrips();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Nie udało się zakończyć przejazdu.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const formik = useFormik<TripFormData>({
    enableReinitialize: true,
    initialValues: selectedTrip ? {
      start_location: selectedTrip.start_location,
      end_location: selectedTrip.end_location,
      intermediate_stops: selectedTrip.intermediate_stops || [],
      date: selectedTrip.date,
      time: selectedTrip.time,
      available_seats: selectedTrip.available_seats,
      price_per_seat: Number(selectedTrip.price_per_seat),
      estimated_duration_minutes: selectedTrip.estimated_duration_minutes ?? undefined,
      luggage_ok: selectedTrip.luggage_ok ?? true,
    } : { start_location: '', end_location: '', intermediate_stops: [], date: '', time: '', available_seats: 1, price_per_seat: 0, estimated_duration_minutes: undefined, luggage_ok: true },
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
          onClick={() => navigate('/driver')}
        >
          Sheero
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
          <Button 
            color="inherit" 
            onClick={() => navigate('/driver')} 
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

      <Container maxWidth="lg" sx={{ flexGrow: 1, pb: 8, pt: 4 }}>
        {loading ? (
          <Box display='flex' justifyContent='center'><CircularProgress /></Box>
        ) : trips.length === 0 ? (
          <Paper elevation={0} sx={{ bgcolor: 'background.paper', p: 6, borderRadius: '16px', textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
            <Typography color="textSecondary">Nie masz jeszcze żadnych przejazdów.</Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {trips.map(trip => (
              <Paper key={trip.id} elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', transition: 'all 0.3s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                      <Typography variant="h5" fontWeight="bold">{trip.start_location}</Typography>
                      <ArrowForward color="action" />
                      <Typography variant="h5" fontWeight="bold">{trip.end_location}</Typography>
                      {trip.available_seats === 1 && (
                        <Chip label="Ostatnie miejsce!" size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }} />
                      )}
                    </Box>
                    <Typography variant="body1" color="textSecondary">{formatDateRelative(trip.date)} • {trip.date} • {trip.time.substring(0, 5)}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">{trip.price_per_seat} zł</Typography>
                    <Typography variant="caption" color="textSecondary">za osobę</Typography>
                  </Box>
                </Box>
                {trip.intermediate_stops && trip.intermediate_stops.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    {trip.intermediate_stops.map((stop, i) => (
                      <Chip key={i} label={stop} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button startIcon={<People />} onClick={() => handleShowPassengers(trip)} sx={{ color: '#000', textTransform: 'none', background: '#f5f5f5', borderRadius: '20px', px: 2, '&:hover': { background: '#eee' } }}>Pasażerowie ({trip.bookings?.length || 0})</Button>
                    <Button startIcon={<Notifications />} onClick={() => handleOpenNotifyDialog(trip)} sx={{ color: '#000', textTransform: 'none', background: '#e3f2fd', borderRadius: '20px', px: 2, '&:hover': { background: '#bbdefb' } }}>Wyślij powiadomienie</Button>
                    {!trip.completed && new Date(trip.date) < new Date(new Date().toDateString()) && (
                      <Button startIcon={<CheckCircle />} onClick={() => handleCompleteTrip(trip)} sx={{ color: '#fff', textTransform: 'none', background: '#4caf50', borderRadius: '20px', px: 2, '&:hover': { background: '#45a049' } }}>Zakończ przejazd</Button>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={() => handleOpenEdit(trip)} color="primary" sx={{ bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}><Edit /></IconButton>
                    <IconButton onClick={() => tripService.cancelTrip(trip.id!)} color="error" sx={{ bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}><Delete /></IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>

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
              <TextField label="Szacowany czas (min)" type="number" name="estimated_duration_minutes" value={formik.values.estimated_duration_minutes ?? ''} onChange={formik.handleChange} fullWidth inputProps={{ min: 0 }} />
              <FormControlLabel control={<Checkbox checked={formik.values.luggage_ok ?? true} onChange={(e) => formik.setFieldValue('luggage_ok', e.target.checked)} name="luggage_ok" />} label="Miejsce na bagaż" />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ borderRadius: '20px', color: '#757575' }}>Anuluj</Button>
          <Button onClick={() => formik.handleSubmit()} variant="contained" sx={{ borderRadius: '20px', bgcolor: '#c62828', '&:hover': { bgcolor: '#b71c1c' } }}>Zapisz</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={passengersDialogOpen} onClose={() => setPassengersDialogOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '30px' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Lista pasażerów</DialogTitle>
        <DialogContent>
          {passengers.length === 0 ? (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>Brak rezerwacji</Typography>
          ) : (
            <List>
              {passengers.map(p => (
                <ListItem key={p.id} divider sx={{ bgcolor: p.status === 'accepted' ? '#e8f5e9' : p.status === 'reserved' ? '#fff3e0' : '#ffebee', borderRadius: '15px', mb: 1, border: '1px solid #e0e0e0' }}>
                  <ListItemText primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}><Typography variant="body1" fontWeight="bold">{p.passenger_username}</Typography><Chip label={p.status === 'paid' ? 'Opłacone' : p.status === 'accepted' ? 'Zaakceptowane' : p.status === 'reserved' ? 'Oczekujące' : 'Anulowane'} size="small" color={p.status === 'paid' ? 'success' : p.status === 'accepted' ? 'info' : p.status === 'reserved' ? 'warning' : 'error'} />{p.status === 'paid' && p.paid_at && (<Typography variant="caption" color="textSecondary">Opłacone: {new Date(p.paid_at).toLocaleString('pl-PL')}</Typography>)}</Box>} secondary={<Box><Typography variant="body2">{p.seats} {p.seats === 1 ? 'miejsce' : 'miejsc'}</Typography>{selectedTrip && (<Typography variant="body2" color="primary" fontWeight="bold">{((typeof selectedTrip.price_per_seat === 'string' ? parseFloat(selectedTrip.price_per_seat) : selectedTrip.price_per_seat) * p.seats).toFixed(2)} zł{p.status === 'paid' ? ' (opłacone)' : p.status === 'accepted' ? ' (oczekujące na płatność)' : ''}</Typography>)}</Box>} />
                  {p.status === 'reserved' && (<Box sx={{ display: 'flex', gap: 1 }}><IconButton onClick={() => handleAcceptBooking(p)} color="success" sx={{ bgcolor: '#e8f5e9', '&:hover': { bgcolor: '#c8e6c9' } }} title="Zaakceptuj"><Check /></IconButton><IconButton onClick={() => handleRejectBooking(p)} color="error" sx={{ bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }} title="Odrzuć"><Close /></IconButton></Box>)}
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPassengersDialogOpen(false)} sx={{ borderRadius: '20px' }}>Zamknij</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={notifyDialogOpen} onClose={() => setNotifyDialogOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '30px' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Wyślij powiadomienie pasażerom</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Wiadomość zostanie wysłana do wszystkich pasażerów z aktywnymi rezerwacjami dla przejazdu: {selectedTrip?.start_location} → {selectedTrip?.end_location}
          </Typography>
          <TextField
            label="Wiadomość"
            multiline
            rows={4}
            fullWidth
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            placeholder="Np. Opóźnienie 15 min, zmiana miejsca spotkania na parking..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNotifyDialogOpen(false)} sx={{ borderRadius: '20px', color: '#757575' }}>Anuluj</Button>
          <Button onClick={handleSendNotification} variant="contained" sx={{ borderRadius: '20px', bgcolor: '#00aff5', '&:hover': { bgcolor: '#0097d6' } }}>Wyślij</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
