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
  Stack,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Logout, ArrowBack } from '@mui/icons-material';
import { tripService, TripFormData, authService } from '../services/api'; // Add authService import
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const validationSchema = yup.object({
  start_location: yup.string().required('Wymagane').min(3, 'Minimum 3 znaki'),
  end_location: yup.string().required('Wymagane').min(3, 'Minimum 3 znaki'),
  date: yup.string().required('Wymagane'),
  time: yup.string().required('Wymagane'),
  available_seats: yup.number().required('Wymagane').min(1, 'Minimum 1').integer('Liczba całkowita'),
  price_per_seat: yup.number().required('Wymagane').min(0, 'Nie może być ujemna'),
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
        enqueueSnackbar('Przejazd został dodany pomyślnie!', { variant: 'success' });
        navigate('/driver');
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 'Wystąpił błąd.';
        enqueueSnackbar(errorMessage, { variant: 'error' });
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

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const CustomInput = (props: any) => (
    <TextField
      fullWidth
      variant="outlined"
      {...props}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '20px',
          bgcolor: 'white',
          '& fieldset': { borderColor: '#e0e0e0' },
          '&:hover fieldset': { borderColor: '#bdbdbd' },
          '&.Mui-focused fieldset': { borderColor: '#c62828' }
        }
      }}
    />
  );

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

      <Container maxWidth="md" sx={{ flexGrow: 1, pb: 8 }}>
        <Paper elevation={0} sx={{ bgcolor: '#f5f5f5', p: { xs: 3, md: 6 }, borderRadius: '40px' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>Dodaj nowy przejazd</Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 6, color: '#757575' }}>Wypełnij szczegóły trasy</Typography>

          <Box component="form" onSubmit={formik.handleSubmit}>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <CustomInput
                  label="Skąd" name="start_location"
                  value={formik.values.start_location} onChange={formik.handleChange}
                  error={formik.touched.start_location && Boolean(formik.errors.start_location)}
                />
                <CustomInput
                  label="Dokąd" name="end_location"
                  value={formik.values.end_location} onChange={formik.handleChange}
                  error={formik.touched.end_location && Boolean(formik.errors.end_location)}
                />
              </Stack>

              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CustomInput
                    label="Dodaj punkt pośredni"
                    value={currentStop}
                    onChange={(e: any) => setCurrentStop(e.target.value)}
                    onKeyPress={(e: any) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStop(); } }}
                  />
                  <IconButton onClick={handleAddStop} sx={{ bgcolor: '#c62828', color: 'white', '&:hover': { bgcolor: '#b71c1c' } }}>
                    <Add />
                  </IconButton>
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {intermediateStops.map((stop, index) => (
                    <Chip
                      key={index} label={stop} onDelete={() => handleRemoveStop(stop)}
                      sx={{ bgcolor: 'white', border: '1px solid #e0e0e0', fontWeight: 'bold' }}
                    />
                  ))}
                </Box>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <CustomInput
                  label="Data" type="date" name="date"
                  value={formik.values.date} onChange={formik.handleChange}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  InputLabelProps={{ shrink: true }}
                />
                <CustomInput
                  label="Godzina" type="time" name="time"
                  value={formik.values.time} onChange={formik.handleChange}
                  error={formik.touched.time && Boolean(formik.errors.time)}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <CustomInput
                  label="Liczba miejsc" type="number" name="available_seats"
                  value={formik.values.available_seats} onChange={formik.handleChange}
                  error={formik.touched.available_seats && Boolean(formik.errors.available_seats)}
                  inputProps={{ min: 1 }}
                />
                <CustomInput
                  label="Cena (PLN)" type="number" name="price_per_seat"
                  value={formik.values.price_per_seat} onChange={formik.handleChange}
                  error={formik.touched.price_per_seat && Boolean(formik.errors.price_per_seat)}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Stack>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: '#c62828',
                  borderRadius: '30px',
                  py: 1.5,
                  mt: 2,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#b71c1c', boxShadow: 'none' }
                }}
              >
                Opublikuj przejazd
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
