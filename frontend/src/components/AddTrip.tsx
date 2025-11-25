import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Chip,
  AppBar,
  Toolbar,
  Stack,
} from '@mui/material';
import { Add, DirectionsCar } from '@mui/icons-material';
import { tripService, TripFormData } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const validationSchema = yup.object({
  start_location: yup
    .string()
    .required('Punkt początkowy jest wymagany')
    .min(3, 'Punkt początkowy musi mieć co najmniej 3 znaki'),
  end_location: yup
    .string()
    .required('Punkt docelowy jest wymagany')
    .min(3, 'Punkt docelowy musi mieć co najmniej 3 znaki'),
  date: yup.string().required('Data jest wymagana'),
  time: yup.string().required('Godzina jest wymagana'),
  available_seats: yup
    .number()
    .required('Liczba miejsc jest wymagana')
    .min(1, 'Musi być co najmniej 1 miejsce')
    .integer('Liczba miejsc musi być liczbą całkowitą'),
  price_per_seat: yup
    .number()
    .required('Cena za miejsce jest wymagana')
    .min(0, 'Cena nie może być ujemna'),
});

export const AddTrip: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [intermediateStops, setIntermediateStops] = useState<string[]>([]);
  const [currentStop, setCurrentStop] = useState('');

  const formik = useFormik<TripFormData>({
    initialValues: {
      start_location: '',
      end_location: '',
      intermediate_stops: [],
      date: '',
      time: '',
      available_seats: 1,
      price_per_seat: 0,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const tripData: TripFormData = {
          ...values,
          intermediate_stops: intermediateStops,
        };
        await tripService.createTrip(tripData);
        enqueueSnackbar('Przejazd został dodany pomyślnie!', {
          variant: 'success',
        });
        navigate('/driver');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Wystąpił błąd podczas dodawania przejazdu.';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
        });
        console.error('Create trip failed:', error);
      }
    },
  });

  const handleAddStop = () => {
    if (currentStop.trim() && !intermediateStops.includes(currentStop.trim())) {
      setIntermediateStops([...intermediateStops, currentStop.trim()]);
      setCurrentStop('');
    }
  };

  const handleRemoveStop = (stop: string) => {
    setIntermediateStops(intermediateStops.filter((s) => s !== stop));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddStop();
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <DirectionsCar sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dodaj przejazd
          </Typography>
          <Button color="inherit" onClick={() => navigate('/driver')}>
            Panel Kierowcy
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            marginTop: 4,
            marginBottom: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
            }}
          >
            <Avatar
              sx={{
                m: 1,
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
              }}
            >
              <DirectionsCar fontSize="large" />
            </Avatar>
            <Typography
              component="h1"
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Dodaj nowy przejazd
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    id="start_location"
                    name="start_location"
                    label="Punkt początkowy"
                    value={formik.values.start_location}
                    onChange={formik.handleChange}
                    error={formik.touched.start_location && Boolean(formik.errors.start_location)}
                    helperText={formik.touched.start_location && formik.errors.start_location}
                    required
                  />
                  <TextField
                    fullWidth
                    id="end_location"
                    name="end_location"
                    label="Punkt docelowy"
                    value={formik.values.end_location}
                    onChange={formik.handleChange}
                    error={formik.touched.end_location && Boolean(formik.errors.end_location)}
                    helperText={formik.touched.end_location && formik.errors.end_location}
                    required
                  />
                </Stack>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Punkty pośrednie (opcjonalne)
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Dodaj punkt pośredni"
                      value={currentStop}
                      onChange={(e) => setCurrentStop(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <IconButton color="primary" onClick={handleAddStop} disabled={!currentStop.trim()}>
                      <Add />
                    </IconButton>
                  </Stack>
                  {intermediateStops.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {intermediateStops.map((stop, index) => (
                        <Chip
                          key={index}
                          label={stop}
                          onDelete={() => handleRemoveStop(stop)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    id="date"
                    name="date"
                    label="Data"
                    type="date"
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    helperText={formik.touched.date && formik.errors.date}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />
                  <TextField
                    fullWidth
                    id="time"
                    name="time"
                    label="Godzina"
                    type="time"
                    value={formik.values.time}
                    onChange={formik.handleChange}
                    error={formik.touched.time && Boolean(formik.errors.time)}
                    helperText={formik.touched.time && formik.errors.time}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    id="available_seats"
                    name="available_seats"
                    label="Liczba dostępnych miejsc"
                    type="number"
                    value={formik.values.available_seats}
                    onChange={formik.handleChange}
                    error={formik.touched.available_seats && Boolean(formik.errors.available_seats)}
                    helperText={formik.touched.available_seats && formik.errors.available_seats}
                    inputProps={{ min: 1 }}
                    required
                  />
                  <TextField
                    fullWidth
                    id="price_per_seat"
                    name="price_per_seat"
                    label="Cena za miejsce (PLN)"
                    type="number"
                    value={formik.values.price_per_seat}
                    onChange={formik.handleChange}
                    error={formik.touched.price_per_seat && Boolean(formik.errors.price_per_seat)}
                    helperText={formik.touched.price_per_seat && formik.errors.price_per_seat}
                    inputProps={{ min: 0, step: 0.01 }}
                    required
                  />
                </Stack>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  type="button"
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/driver')}
                >
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    },
                  }}
                >
                  Dodaj przejazd
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

