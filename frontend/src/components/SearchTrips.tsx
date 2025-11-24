import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { Search, DirectionsCar, LocationOn, CalendarToday, AccessTime, People, AttachMoney } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Trip, tripService } from '../services/api';

const validationSchema = yup.object({
  start_location: yup.string().required('Punkt początkowy jest wymagany'),
  end_location: yup.string().required('Punkt docelowy jest wymagany'),
  date: yup.string().required('Data jest wymagana'), // Data jest wymagana
});

interface SearchFormData {
  start_location: string;
  end_location: string;
  date: string;
}

export const SearchTrips: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const formik = useFormik<SearchFormData>({
    initialValues: {
      start_location: '',
      end_location: '',
      date: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setSearched(true);
      try {
        // Budujemy parametry tylko dla wypełnionych pól
        const params = new URLSearchParams();
        if (values.start_location && values.start_location.trim()) {
          params.append('start_location', values.start_location.trim());
        }
        if (values.end_location && values.end_location.trim()) {
          params.append('end_location', values.end_location.trim());
        }
        if (values.date && values.date.trim()) {
          params.append('date', values.date.trim());
        }
        
        console.log('Searching with params:', {
          start: values.start_location.trim(),
          end: values.end_location.trim(),
          date: values.date,
          paramsString: params.toString()
        });
        const data = await tripService.searchTrips(params.toString());
        console.log('Found trips:', data);
        console.log('Number of trips found:', data.length);
        setTrips(data);
        if (data.length === 0) {
          enqueueSnackbar('Nie znaleziono przejazdów spełniających kryteria.', { variant: 'info' });
        }
      } catch (error: any) {
        console.error('Search error:', error);
        const msg =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Nie udało się wyszukać przejazdów.';
        enqueueSnackbar(msg, { variant: 'error' });
        setTrips([]);
      } finally {
        setLoading(false);
      }
    },
  });

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
            Wyszukaj przejazd
          </Typography>
          <Button color="inherit" onClick={() => navigate('/passenger')}>
            Panel Pasażera
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
            mb: 4,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Wyszukaj przejazd
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Podaj miejsce startu, cel oraz datę, aby znaleźć dostępne przejazdy.
          </Typography>
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Punkt początkowy"
                    name="start_location"
                    value={formik.values.start_location}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.start_location && Boolean(formik.errors.start_location)}
                    helperText={formik.touched.start_location && formik.errors.start_location}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Punkt docelowy"
                    name="end_location"
                    value={formik.values.end_location}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.end_location && Boolean(formik.errors.end_location)}
                    helperText={formik.touched.end_location && formik.errors.end_location}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Data"
                    name="date"
                    type="date"
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    helperText={formik.touched.date && formik.errors.date}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0] // Minimalna data to dzisiaj
                    }}
                  />
                </Box>
              </Stack>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Search />}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                  },
                  maxWidth: 300,
                  mx: 'auto',
                }}
              >
                {loading ? 'Wyszukiwanie...' : 'Szukaj przejazdów'}
              </Button>
            </Stack>
          </Box>
        </Paper>

        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {!loading && searched && trips.length > 0 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Znalezione przejazdy ({trips.length})
            </Typography>
            <Stack spacing={2}>
              {trips.map((trip) => (
                <Card key={trip.id} elevation={2} sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {formatRoute(trip)}
                        </Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1 }}>
                          <Chip
                            icon={<CalendarToday />}
                            label={trip.date}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={<AccessTime />}
                            label={trip.time}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={<People />}
                            label={`${trip.available_seats} miejsc`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                          <Chip
                            icon={<AttachMoney />}
                            label={`${trip.price_per_seat} PLN`}
                            size="small"
                            variant="outlined"
                            color="success"
                          />
                        </Stack>
                        {trip.intermediate_stops && trip.intermediate_stops.length > 0 && (
                          <Box mt={2}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Punkty pośrednie:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {trip.intermediate_stops.map((stop: string, idx: number) => (
                                <Chip
                                  key={idx}
                                  label={stop}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Kierowca: <strong>{trip.driver_username}</strong>
                        </Typography>
                      </Box>
                      <Box>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => {
                            // TODO: Implementacja rezerwacji
                            enqueueSnackbar('Funkcjonalność rezerwacji będzie dostępna wkrótce.', {
                              variant: 'info',
                            });
                          }}
                        >
                          Zarezerwuj miejsce
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {!loading && searched && trips.length === 0 && (
          <Paper
            elevation={2}
            sx={{
              p: 4,
              textAlign: 'center',
              background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Nie znaleziono przejazdów
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Spróbuj zmienić kryteria wyszukiwania lub wybierz inną datę.
            </Typography>
          </Paper>
        )}
      </Container>
    </>
  );
};

