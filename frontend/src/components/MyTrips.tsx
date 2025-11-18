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
  Toolbar,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  DirectionsCar,
  Edit,
  Groups,
  HighlightOff,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Booking, Trip, TripFormData, tripService } from '../services/api';

const validationSchema = yup.object({
  start_location: yup.string().required('Punkt początkowy jest wymagany').min(3, 'Minimum 3 znaki'),
  end_location: yup.string().required('Punkt docelowy jest wymagany').min(3, 'Minimum 3 znaki'),
  date: yup.string().required('Data jest wymagana'),
  time: yup.string().required('Godzina jest wymagana'),
  available_seats: yup
    .number()
    .required('Liczba miejsc jest wymagana')
    .min(1, 'Co najmniej 1 miejsce')
    .integer('Musi być liczbą całkowitą'),
  price_per_seat: yup.number().required('Cena jest wymagana').min(0, 'Cena nie może być ujemna'),
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
  const [passengersLoading, setPassengersLoading] = useState(false);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await tripService.getMyTrips();
      setTrips(data);
    } catch (error: any) {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Nie udało się pobrać przejazdów.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleOpenEdit = (trip: Trip) => {
    setSelectedTrip(trip);
    setEditStops(trip.intermediate_stops || []);
    setNewStop('');
    setEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setSelectedTrip(null);
    setEditStops([]);
    setNewStop('');
  };

  const handleAddStop = () => {
    const value = newStop.trim();
    if (value && !editStops.includes(value)) {
      setEditStops((prev) => [...prev, value]);
      setNewStop('');
    }
  };

  const handleRemoveStop = (stop: string) => {
    setEditStops((prev) => prev.filter((s) => s !== stop));
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
      : {
          start_location: '',
          end_location: '',
          intermediate_stops: [],
          date: '',
          time: '',
          available_seats: 1,
          price_per_seat: 0,
        },
    validationSchema,
    onSubmit: async (values) => {
      if (!selectedTrip?.id) return;
      try {
        await tripService.updateTrip(selectedTrip.id, {
          ...values,
          intermediate_stops: editStops,
        });
        enqueueSnackbar('Przejazd został zaktualizowany.', { variant: 'success' });
        await loadTrips();
        handleCloseEdit();
      } catch (error: any) {
        const msg =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Nie udało się zaktualizować przejazdu.';
        enqueueSnackbar(msg, { variant: 'error' });
      }
    },
  });

  const handleShowPassengers = async (trip: Trip) => {
    setPassengersDialogOpen(true);
    setPassengers([]);
    setPassengersLoading(true);
    try {
      const data = await tripService.getPassengers(trip.id!);
      setPassengers(data);
    } catch (error: any) {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Nie udało się pobrać listy pasażerów.';
      enqueueSnackbar(msg, { variant: 'error' });
      setPassengersDialogOpen(false);
    } finally {
      setPassengersLoading(false);
    }
  };

  const handleCancelTrip = async (trip: Trip) => {
    const confirmed = window.confirm('Czy na pewno chcesz anulować ten przejazd?');
    if (!confirmed || !trip.id) return;
    try {
      await tripService.cancelTrip(trip.id);
      enqueueSnackbar('Przejazd został anulowany.', { variant: 'info' });
      await loadTrips();
    } catch (error: any) {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Nie udało się anulować przejazdu.';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const formatRoute = (trip: Trip) => {
    const stops = trip.intermediate_stops || [];
    if (stops.length === 0) {
      return `${trip.start_location} → ${trip.end_location}`;
    }
    return `${trip.start_location} → [${stops.join(', ')}] → ${trip.end_location}`;
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <DirectionsCar sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Moje przejazdy
          </Typography>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
            minHeight: 400,
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} mb={3}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Moje przejazdy
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Zarządzaj opublikowanymi ofertami, edytuj je, anuluj lub zobacz pasażerów.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={loadTrips} disabled={loading}>
                Odśwież
              </Button>
              <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/trips/add')}>
                Dodaj przejazd
              </Button>
            </Stack>
          </Stack>
          <Divider sx={{ mb: 3 }} />
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : trips.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" gutterBottom>
                Nie masz jeszcze żadnych przejazdów.
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/trips/add')}>
                Dodaj pierwszy przejazd
              </Button>
            </Box>
          ) : (
            <Stack spacing={2}>
              {trips.map((trip) => {
                const stops = trip.intermediate_stops || [];
                const hasStops = Array.isArray(stops) && stops.length > 0;
                return (
                  <Card key={trip.id} elevation={2} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {formatRoute(trip)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {trip.date} o {trip.time}
                          </Typography>
                          <Stack direction="row" spacing={2} mt={1} flexWrap="wrap">
                            <Typography variant="body2">
                              Miejsca: <strong>{trip.available_seats}</strong>
                            </Typography>
                            <Typography variant="body2">
                              Cena: <strong>{trip.price_per_seat} PLN</strong>
                            </Typography>
                          </Stack>
                          {hasStops && (
                            <Box mt={2} p={1.5} sx={{ bgcolor: '#f5f5f5', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                                📍 Punkty pośrednie:
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {stops.map((stop: string, idx: number) => (
                                  <Chip
                                    key={`${trip.id}-stop-${idx}`}
                                    label={stop}
                                    size="medium"
                                    color="primary"
                                    sx={{
                                      fontWeight: 500,
                                      '& .MuiChip-label': {
                                        fontSize: '0.875rem',
                                      },
                                    }}
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}
                          {trip.bookings && trip.bookings.length > 0 && (
                            <Typography variant="body2" color="text.secondary" mt={1}>
                              Rezerwacje: {trip.bookings.length}
                            </Typography>
                          )}
                        </Box>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Button
                            variant="outlined"
                            startIcon={<Groups />}
                            onClick={() => handleShowPassengers(trip)}
                            fullWidth={false}
                          >
                            Pasażerowie
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Edit />}
                            onClick={() => handleOpenEdit(trip)}
                            fullWidth={false}
                          >
                            Edytuj
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<HighlightOff />}
                            onClick={() => handleCancelTrip(trip)}
                            fullWidth={false}
                          >
                            Anuluj
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Paper>
      </Container>

      <Dialog open={editDialogOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edytuj przejazd</DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
            <Stack spacing={2}>
              <TextField
                label="Punkt początkowy"
                name="start_location"
                value={formik.values.start_location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.start_location && Boolean(formik.errors.start_location)}
                helperText={formik.touched.start_location && formik.errors.start_location}
                fullWidth
              />
              <TextField
                label="Punkt docelowy"
                name="end_location"
                value={formik.values.end_location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.end_location && Boolean(formik.errors.end_location)}
                helperText={formik.touched.end_location && formik.errors.end_location}
                fullWidth
              />
              <Stack spacing={1}>
                <Typography variant="subtitle2">Punkty pośrednie</Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Dodaj punkt pośredni"
                    value={newStop}
                    onChange={(e) => setNewStop(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddStop();
                      }
                    }}
                  />
                  <IconButton color="primary" onClick={handleAddStop} disabled={!newStop.trim()}>
                    <Add />
                  </IconButton>
                </Stack>
                {editStops.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {editStops.map((stop) => (
                      <Chip
                        key={stop}
                        label={stop}
                        onDelete={() => handleRemoveStop(stop)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Data"
                  name="date"
                  type="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Godzina"
                  name="time"
                  type="time"
                  value={formik.values.time}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.time && Boolean(formik.errors.time)}
                  helperText={formik.touched.time && formik.errors.time}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Liczba miejsc"
                  name="available_seats"
                  type="number"
                  value={formik.values.available_seats}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.available_seats && Boolean(formik.errors.available_seats)}
                  helperText={formik.touched.available_seats && formik.errors.available_seats}
                  inputProps={{ min: 1 }}
                  fullWidth
                />
                <TextField
                  label="Cena za miejsce (PLN)"
                  name="price_per_seat"
                  type="number"
                  value={formik.values.price_per_seat}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.price_per_seat && Boolean(formik.errors.price_per_seat)}
                  helperText={formik.touched.price_per_seat && formik.errors.price_per_seat}
                  inputProps={{ min: 0, step: 0.01 }}
                  fullWidth
                />
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Anuluj</Button>
          <Button onClick={() => formik.handleSubmit()} variant="contained">
            Zapisz zmiany
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={passengersDialogOpen} onClose={() => setPassengersDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Pasażerowie</DialogTitle>
        <DialogContent dividers>
          {passengersLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={32} />
            </Box>
          ) : passengers.length === 0 ? (
            <Typography align="center" color="text.secondary">
              Brak rezerwacji dla tego przejazdu.
            </Typography>
          ) : (
            <List>
              {passengers.map((passenger) => (
                <ListItem key={passenger.id} divider>
                  <ListItemText
                    primary={`${passenger.passenger_username} (${passenger.seats} miejsc)`}
                    secondary={`Status: ${passenger.status}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPassengersDialogOpen(false)}>Zamknij</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

