import React from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add, Logout, ArrowBack, Save, Bookmark } from '@mui/icons-material';
import { tripService, TripFormData, authService, tripTemplateService, TripTemplate } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

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
  const [templates, setTemplates] = useState<TripTemplate[]>([]);
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');

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
        console.log('Creating trip with data:', tripData); // Debug
        const response = await tripService.createTrip(tripData);
        console.log('Trip created successfully:', response); // Debug
        enqueueSnackbar('Przejazd został dodany pomyślnie!', { variant: 'success' });
        navigate('/driver');
      } catch (error: any) {
        console.error('Error creating trip:', error); // Debug
        console.error('Error response:', error.response); // Debug
        const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Wystąpił błąd podczas dodawania przejazdu.';
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

  // Pobierz szablony przy załadowaniu
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await tripTemplateService.getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };
    loadTemplates();
  }, []);

  // Wypełnij formularz z szablonu
  const handleUseTemplate = (template: TripTemplate) => {
    formik.setFieldValue('start_location', template.start_location);
    formik.setFieldValue('end_location', template.end_location);
    formik.setFieldValue('time', template.time || '');
    formik.setFieldValue('available_seats', template.available_seats);
    formik.setFieldValue('price_per_seat', Number(template.price_per_seat));
    setIntermediateStops(template.intermediate_stops || []);
    enqueueSnackbar(`Wypełniono formularz z szablonu: ${template.name}`, { variant: 'info' });
  };

  // Zapisz jako szablon
  const handleSaveAsTemplate = async () => {
    if (!formik.values.start_location || !formik.values.end_location) {
      enqueueSnackbar('Wypełnij przynajmniej miejsca wyjazdu i docelowe.', { variant: 'warning' });
      return;
    }

    try {
      await tripTemplateService.createTemplate({
        name: templateName || `${formik.values.start_location} → ${formik.values.end_location}`,
        start_location: formik.values.start_location,
        end_location: formik.values.end_location,
        intermediate_stops: intermediateStops,
        time: formik.values.time,
        available_seats: formik.values.available_seats,
        price_per_seat: formik.values.price_per_seat,
      });
      enqueueSnackbar('Szablon został zapisany!', { variant: 'success' });
      setSaveTemplateDialogOpen(false);
      setTemplateName('');
      // Odśwież listę szablonów
      const data = await tripTemplateService.getTemplates();
      setTemplates(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Nie udało się zapisać szablonu.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Dodaj nowy przejazd</Typography>
            {templates.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Użyj szablonu</InputLabel>
                <Select
                  value=""
                  label="Użyj szablonu"
                  onChange={(e) => {
                    const template = templates.find(t => t.id === Number(e.target.value));
                    if (template) handleUseTemplate(template);
                  }}
                  sx={{ borderRadius: '20px', bgcolor: 'white' }}
                >
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
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

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  onClick={() => setSaveTemplateDialogOpen(true)}
                  variant="outlined"
                  startIcon={<Save />}
                  sx={{
                    borderRadius: '30px',
                    py: 1.5,
                    flex: 1,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderColor: '#c62828',
                    color: '#c62828',
                    '&:hover': { borderColor: '#b71c1c', bgcolor: '#ffebee' }
                  }}
                >
                  Zapisz jako szablon
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: '#c62828',
                    borderRadius: '30px',
                    py: 1.5,
                    flex: 2,
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
            </Stack>
          </Box>
        </Paper>

        {/* Dialog zapisywania szablonu */}
        <Dialog
          open={saveTemplateDialogOpen}
          onClose={() => setSaveTemplateDialogOpen(false)}
          PaperProps={{ sx: { borderRadius: '30px', p: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>Zapisz jako szablon</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Nazwa szablonu"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={`${formik.values.start_location} → ${formik.values.end_location}`}
              sx={{ mt: 2 }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Szablon zostanie zapisany z aktualnymi danymi trasy (bez daty).
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setSaveTemplateDialogOpen(false)} sx={{ borderRadius: '20px' }}>
              Anuluj
            </Button>
            <Button
              onClick={handleSaveAsTemplate}
              variant="contained"
              sx={{ borderRadius: '20px', bgcolor: '#c62828', '&:hover': { bgcolor: '#b71c1c' } }}
            >
              Zapisz
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};
