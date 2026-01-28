import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
  CircularProgress,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowForward,
  PersonOutline,
  Close as CloseIcon,
  Logout,
  Star,
  StarBorder,
  Delete as DeleteIcon,
  CalendarToday
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pl';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Trip, tripService, authService, favoriteRouteService, FavoriteRoute } from '../services/api';

const validationSchema = yup.object({
  start_location: yup.string(),
  end_location: yup.string(),
  date: yup.string(),
  max_price: yup
    .number()
    .typeError('Cena musi być liczbą')
    .min(0, 'Cena nie może być ujemna')
    .nullable(),
});

interface SearchFormData {
  start_location: string;
  end_location: string;
  date: string;
  max_price?: number | null;
}

export const SearchTrips: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [favoriteRoutes, setFavoriteRoutes] = useState<FavoriteRoute[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const [passengerCount, setPassengerCount] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Konfiguracja dayjs dla polskiego języka
  dayjs.locale('pl');

  // Funkcja ładowania wszystkich dostępnych przejazdów
  const loadAllTrips = async () => {
    setLoading(true);
    try {
      const data = await tripService.searchTrips('');
      const filteredBySeats = data.filter((trip: Trip) => trip.available_seats >= passengerCount);
      setTrips(filteredBySeats);
    } catch (error: any) {
      enqueueSnackbar('Nie udało się pobrać przejazdów.', { variant: 'error' });
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', fontWeight: 'bold' }}>
        <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: 'bold', mt: 0.5 }}>zł</Typography>
        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{price}</Typography>
      </Box>
    );
  };

  const formik = useFormik<SearchFormData>({
    initialValues: {
      start_location: '',
      end_location: '',
      date: '',
      max_price: undefined,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setSearched(true);
      try {
        const params = new URLSearchParams();
        if (values.start_location && values.start_location.trim()) {
          params.append('start_location', values.start_location.trim());
        }
        if (values.end_location && values.end_location.trim()) {
          params.append('end_location', values.end_location.trim());
        }
        // Użyj selectedDate zamiast values.date
        if (selectedDate) {
          params.append('date', selectedDate.format('YYYY-MM-DD'));
        }
        const data = await tripService.searchTrips(params.toString());
        let result = data.filter((trip: Trip) => trip.available_seats >= passengerCount);
        if (values.max_price != null && values.max_price !== undefined && !Number.isNaN(values.max_price)) {
          result = result.filter((trip: Trip) => Number(trip.price_per_seat) <= values.max_price!);
          setMaxPrice(values.max_price);
        } else {
          setMaxPrice(null);
        }
        setTrips(result);
        if (result.length === 0) {
          if (data.length === 0) {
            enqueueSnackbar('Nie znaleziono przejazdów spełniających kryteria.', { variant: 'info' });
          } else {
            enqueueSnackbar(`Znaleziono ${data.length} przejazdów, ale żaden nie spełnia filtrów (miejsca/cena).`, { variant: 'warning' });
          }
        }
      } catch (error: any) {
        enqueueSnackbar('Nie udało się wyszukać przejazdów.', { variant: 'error' });
        setTrips([]);
      } finally {
        setLoading(false);
      }
    },
  });

  // Filtrowanie przejazdów na podstawie wybranej daty
  const getFilteredTripsByDate = () => {
    if (!selectedDate) return trips;
    
    const selectedDateStr = selectedDate.format('YYYY-MM-DD');
    return trips.filter(trip => trip.date === selectedDateStr);
  };

  const filteredTripsByDate = getFilteredTripsByDate();
  const filteredTrips =
    maxPrice != null
      ? filteredTripsByDate.filter((trip) => Number(trip.price_per_seat) <= maxPrice)
      : filteredTripsByDate;
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === 'price') return a.price_per_seat - b.price_per_seat;
    if (sortBy === 'time') return a.time.localeCompare(b.time);
    return 0;
  });

  const getArrivalTime = (departureTime: string) => {
    if (!departureTime) return "00:00";
    const [hours, minutes] = departureTime.split(':').map(Number);
    let arrHours = hours + 2;
    if (arrHours >= 24) arrHours -= 24;
    return `${arrHours}:${minutes.toString().padStart(2, '0')}`;
  };

  const handlePassengerClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePassengerClose = () => {
    setAnchorEl(null);
  };
  const handlePassengerSelect = (count: number) => {
    setPassengerCount(count);
    handlePassengerClose();
  };

  // Automatyczne ładowanie przejazdów przy starcie
  useEffect(() => {
    loadAllTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passengerCount]);

  useEffect(() => {
    const loadFavoriteRoutes = async () => {
      try {
        setLoadingFavorites(true);
        const routes = await favoriteRouteService.getFavoriteRoutes();
        setFavoriteRoutes(routes);
      } catch (error) {
      } finally {
        setLoadingFavorites(false);
      }
    };
    loadFavoriteRoutes();
  }, []);

  const isCurrentRouteFavorite = () => {
    if (!formik.values.start_location || !formik.values.end_location) return false;
    return favoriteRoutes.some(
      route =>
        route.start_location.toLowerCase().trim() === formik.values.start_location.toLowerCase().trim() &&
        route.end_location.toLowerCase().trim() === formik.values.end_location.toLowerCase().trim()
    );
  };

  const handleSaveAsFavorite = async () => {
    if (!formik.values.start_location || !formik.values.end_location) {
      enqueueSnackbar('Wypełnij miejsca wyjazdu i docelowe, aby zapisać trasę.', { variant: 'warning' });
      return;
    }

    try {
      const newRoute = await favoriteRouteService.createFavoriteRoute({
        start_location: formik.values.start_location.trim(),
        end_location: formik.values.end_location.trim(),
      });
      setFavoriteRoutes([...favoriteRoutes, newRoute]);
      enqueueSnackbar('Trasa została zapisana jako ulubiona!', { variant: 'success' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.end_location?.[0] || 'Nie udało się zapisać trasy.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleDeleteFavorite = async (routeId: number) => {
    try {
      await favoriteRouteService.deleteFavoriteRoute(routeId);
      setFavoriteRoutes(favoriteRoutes.filter(route => route.id !== routeId));
      enqueueSnackbar('Trasa została usunięta z ulubionych.', { variant: 'info' });
    } catch (error) {
      enqueueSnackbar('Nie udało się usunąć trasy.', { variant: 'error' });
    }
  };

  const handleUseFavoriteRoute = (route: FavoriteRoute) => {
    formik.setFieldValue('start_location', route.start_location);
    formik.setFieldValue('end_location', route.end_location);
    formik.handleSubmit();
  };

  const handleQuickDateSelect = (date: Dayjs | null) => {
    setSelectedDate(date);
    if (searched) {
      // Automatycznie wyszukaj ponownie jeśli użytkownik już szukał
      formik.handleSubmit();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Box sx={{ bgcolor: '#ffffff', pb: 3, borderBottom: '1px solid #e0e0e0' }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                color: '#00aff5', 
                ml: 2,
                fontSize: '28px',
                cursor: 'pointer' 
              }} 
              onClick={() => {
                const isAuthenticated = !!localStorage.getItem('token');
                navigate(isAuthenticated ? '/dashboard' : '/');
              }}
            >
              Sheero
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
              <Button 
                color="inherit" 
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#333',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }} 
                onClick={() => navigate('/search')}
              >
                Wyszukaj
              </Button>
              <IconButton onClick={() => navigate('/profile')}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#00aff5' }}>
                  <PersonOutline />
                </Avatar>
              </IconButton>
              <IconButton 
                onClick={() => { authService.logout(); navigate('/login'); }} 
                title="Wyloguj"
                sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                <Logout />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ px: 3 }}>
          <Paper 
            component="form" 
            onSubmit={formik.handleSubmit} 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: '16px', 
              bgcolor: '#ffffff',
              border: '1px solid #e0e0e0',
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              flexWrap: 'wrap' 
            }}
          >
            <TextField
              fullWidth
              placeholder="Skąd?"
              variant="outlined"
              name="start_location"
              value={formik.values.start_location}
              onChange={formik.handleChange}
              sx={{
                flex: 1,
                minWidth: '200px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8f9fa',
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00aff5',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00aff5',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#00aff5' }} />
                  </InputAdornment>
                ),
                endAdornment: formik.values.start_location && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => formik.setFieldValue('start_location', '')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <ArrowForward sx={{ color: '#00aff5' }} />
            <TextField
              fullWidth
              placeholder="Dokąd?"
              variant="outlined"
              name="end_location"
              value={formik.values.end_location}
              onChange={formik.handleChange}
              sx={{
                flex: 1,
                minWidth: '200px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8f9fa',
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00aff5',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00aff5',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#00aff5' }} />
                  </InputAdornment>
                ),
                endAdornment: formik.values.end_location && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => formik.setFieldValue('end_location', '')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Box onClick={handlePassengerClick} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: '12px', bgcolor: '#f8f9fa', cursor: 'pointer', '&:hover': { bgcolor: '#e3f2fd' } }}>
              <PersonOutline sx={{ color: '#00aff5' }} />
              <Typography variant="body2" fontWeight={600}>{passengerCount} {passengerCount === 1 ? 'pasażer' : 'pasażerów'}</Typography>
            </Box>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handlePassengerClose}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <MenuItem key={num} onClick={() => handlePassengerSelect(num)}>
                  {num} {num === 1 ? 'pasażer' : 'pasażerów'}
                </MenuItem>
              ))}
            </Menu>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                onClick={handleSaveAsFavorite} 
                disabled={!formik.values.start_location || !formik.values.end_location} 
                sx={{ 
                  color: isCurrentRouteFavorite() ? '#fbbc05' : '#757575', 
                  '&:hover': { color: '#fbbc05' } 
                }} 
                title={isCurrentRouteFavorite() ? 'Trasa jest już w ulubionych' : 'Zapisz trasę jako ulubioną'}
              >
                {isCurrentRouteFavorite() ? <Star /> : <StarBorder />}
              </IconButton>
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ 
                  borderRadius: '12px', 
                  bgcolor: '#00aff5', 
                  px: 4, 
                  py: 1.2, 
                  textTransform: 'none', 
                  fontSize: '1rem',
                  fontWeight: 700,
                  minWidth: '120px', 
                  boxShadow: '0 4px 12px rgba(0, 175, 245, 0.3)',
                  '&:hover': { 
                    bgcolor: '#0099d6',
                    boxShadow: '0 6px 16px rgba(0, 175, 245, 0.4)'
                  } 
                }}
              >
                Szukaj
              </Button>
            </Box>
          </Paper>

          {/* Date Picker z szybkimi przyciskami */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <DatePicker
              label="Data wyjazdu"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              minDate={dayjs()}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: {
                    bgcolor: '#ffffff',
                    borderRadius: '12px',
                    minWidth: '200px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00aff5',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00aff5',
                      },
                    },
                  },
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday sx={{ color: '#00aff5', fontSize: '20px' }} />
                      </InputAdornment>
                    ),
                  }
                }
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="Dzisiaj"
                onClick={() => handleQuickDateSelect(dayjs())}
                sx={{
                  bgcolor: selectedDate?.isSame(dayjs(), 'day') ? '#00aff5' : '#f8f9fa',
                  color: selectedDate?.isSame(dayjs(), 'day') ? '#ffffff' : '#424242',
                  fontWeight: selectedDate?.isSame(dayjs(), 'day') ? 700 : 500,
                  borderRadius: '20px',
                  px: 1,
                  '&:hover': {
                    bgcolor: selectedDate?.isSame(dayjs(), 'day') ? '#0099d6' : '#e3f2fd',
                  },
                }}
              />
              <Chip
                label="Jutro"
                onClick={() => handleQuickDateSelect(dayjs().add(1, 'day'))}
                sx={{
                  bgcolor: selectedDate?.isSame(dayjs().add(1, 'day'), 'day') ? '#00aff5' : '#f8f9fa',
                  color: selectedDate?.isSame(dayjs().add(1, 'day'), 'day') ? '#ffffff' : '#424242',
                  fontWeight: selectedDate?.isSame(dayjs().add(1, 'day'), 'day') ? 700 : 500,
                  borderRadius: '20px',
                  px: 1,
                  '&:hover': {
                    bgcolor: selectedDate?.isSame(dayjs().add(1, 'day'), 'day') ? '#0099d6' : '#e3f2fd',
                  },
                }}
              />
              <Chip
                label="Za 2 dni"
                onClick={() => handleQuickDateSelect(dayjs().add(2, 'day'))}
                sx={{
                  bgcolor: selectedDate?.isSame(dayjs().add(2, 'day'), 'day') ? '#00aff5' : '#f8f9fa',
                  color: selectedDate?.isSame(dayjs().add(2, 'day'), 'day') ? '#ffffff' : '#424242',
                  fontWeight: selectedDate?.isSame(dayjs().add(2, 'day'), 'day') ? 700 : 500,
                  borderRadius: '20px',
                  px: 1,
                  '&:hover': {
                    bgcolor: selectedDate?.isSame(dayjs().add(2, 'day'), 'day') ? '#0099d6' : '#e3f2fd',
                  },
                }}
              />
              <Chip
                label="Za 3 dni"
                onClick={() => handleQuickDateSelect(dayjs().add(3, 'day'))}
                sx={{
                  bgcolor: selectedDate?.isSame(dayjs().add(3, 'day'), 'day') ? '#00aff5' : '#f8f9fa',
                  color: selectedDate?.isSame(dayjs().add(3, 'day'), 'day') ? '#ffffff' : '#424242',
                  fontWeight: selectedDate?.isSame(dayjs().add(3, 'day'), 'day') ? 700 : 500,
                  borderRadius: '20px',
                  px: 1,
                  '&:hover': {
                    bgcolor: selectedDate?.isSame(dayjs().add(3, 'day'), 'day') ? '#0099d6' : '#e3f2fd',
                  },
                }}
              />
              {selectedDate && (
                <Chip
                  label="Wyczyść"
                  onClick={() => handleQuickDateSelect(null)}
                  icon={<CloseIcon sx={{ fontSize: '18px !important' }} />}
                  sx={{
                    bgcolor: '#f44336',
                    color: '#ffffff',
                    fontWeight: 500,
                    borderRadius: '20px',
                    px: 1,
                    '&:hover': {
                      bgcolor: '#d32f2f',
                    },
                  }}
                />
              )}
            </Box>
          </Box>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6 }}>
          <Box sx={{ width: { xs: '100%', md: '25%' } }}>
            {favoriteRoutes.length > 0 && (
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '16px', bgcolor: '#ffffff', border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#424242' }}>Ulubione trasy</Typography>
                  <Star sx={{ color: '#fbbc05', fontSize: '20px' }} />
                </Box>
                {loadingFavorites ? (
                  <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} sx={{ color: '#00aff5' }} /></Box>
                ) : (
                  <Stack spacing={1.5}>
                    {favoriteRoutes.map((route) => (
                      <Paper 
                        key={route.id} 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          borderRadius: '12px', 
                          bgcolor: '#f8f9fa', 
                          cursor: 'pointer', 
                          border: '1px solid transparent', 
                          transition: 'all 0.2s',
                          '&:hover': { 
                            borderColor: '#00aff5', 
                            bgcolor: '#e3f2fd',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(0,175,245,0.2)'
                          }, 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center' 
                        }}
                      >
                        <Box onClick={() => handleUseFavoriteRoute(route)} sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#424242' }}>{route.start_location}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <ArrowForward sx={{ fontSize: '12px', color: '#00aff5', mr: 0.5 }} />
                            <Typography variant="caption" color="textSecondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{route.end_location}</Typography>
                          </Box>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (route.id) handleDeleteFavorite(route.id); 
                          }} 
                          sx={{ 
                            color: '#757575', 
                            ml: 1,
                            '&:hover': { 
                              color: '#dc3545',
                              bgcolor: '#ffebee' 
                            } 
                          }} 
                          title="Usuń z ulubionych"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                  ))}
                </Stack>
              )}
            </Paper>
            )}
            
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: '#ffffff', border: '1px solid #e0e0e0', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#424242', mb: 2 }}>
                Filtry
              </Typography>
              <TextField
                label="Maksymalna cena za osobę (zł)"
                type="number"
                fullWidth
                size="small"
                value={formik.values.max_price ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const num = value === '' ? null : Number(value);
                  formik.setFieldValue('max_price', num);
                }}
                sx={{ mb: 2 }}
                inputProps={{ min: 0 }}
              />
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: '#ffffff', border: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#424242', mb: 2 }}>Sortuj według</Typography>
              <RadioGroup value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <FormControlLabel 
                  value="time" 
                  control={<Radio sx={{ color: '#00aff5', '&.Mui-checked': { color: '#00aff5' } }} size="small" />} 
                  label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Godziny odjazdu</Typography>} 
                  sx={{ mb: 1 }} 
                />
                <FormControlLabel 
                  value="price" 
                  control={<Radio sx={{ color: '#00aff5', '&.Mui-checked': { color: '#00aff5' } }} size="small" />} 
                  label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Ceny</Typography>} 
                  sx={{ mb: 1 }} 
                />
                <FormControlLabel 
                  value="dist" 
                  control={<Radio sx={{ color: '#00aff5', '&.Mui-checked': { color: '#00aff5' } }} size="small" />} 
                  label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Blisko miejsca wyjazdu</Typography>} 
                  sx={{ mb: 1 }} 
                />
                <FormControlLabel 
                  value="duration" 
                  control={<Radio sx={{ color: '#00aff5', '&.Mui-checked': { color: '#00aff5' } }} size="small" />} 
                  label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Najkrótszy przejazd</Typography>} 
                  sx={{ mb: 1 }} 
                />
              </RadioGroup>
            </Paper>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '75%' } }}>
            <Paper 
              elevation={0} 
              sx={{ 
                bgcolor: '#ffffff', 
                py: 2, 
                px: 3, 
                borderRadius: '16px', 
                mb: 3, 
                textAlign: 'center',
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242' }}>
                {loading ? 'Szukanie...' : sortedTrips.length === 0 ? 'Brak dostępnych przejazdów' : `Znaleziono ${sortedTrips.length} ${sortedTrips.length === 1 ? 'przejazd' : sortedTrips.length < 5 ? 'przejazdy' : 'przejazdów'}`}
              </Typography>
            </Paper>
            <Stack spacing={3}>
              {loading ? (
                <Box display="flex" justifyContent="center"><CircularProgress sx={{ color: '#00aff5' }} /></Box>
              ) : (
                sortedTrips.map((trip) => (
                  <Paper 
                    key={trip.id} 
                    elevation={0} 
                    onClick={() => navigate(`/trips/${trip.id}`)} 
                    sx={{ 
                      borderRadius: '16px', 
                      overflow: 'hidden', 
                      border: '1px solid #e0e0e0', 
                      cursor: 'pointer', 
                      bgcolor: '#ffffff',
                      transition: 'all 0.2s', 
                      '&:hover': { 
                        transform: 'translateY(-4px)', 
                        boxShadow: '0 8px 24px rgba(0,175,245,0.15)',
                        borderColor: '#00aff5'
                      } 
                    }}
                  >
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ width: '60%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, px: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#424242' }}>{trip.time?.substring(0, 5)}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#424242' }}>{getArrivalTime(trip.time)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#424242' }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{trip.start_location}</Typography>
                          <ArrowForward fontSize="small" sx={{ color: '#00aff5', mx: 2 }} />
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{trip.end_location}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#00aff5' }}>{formatPrice(trip.price_per_seat)}</Typography>
                        <Typography variant="caption" sx={{ color: '#757575' }}>za osobę</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ bgcolor: '#f8f9fa', p: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar 
                          src={trip.driver_profile?.avatar || undefined} 
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            border: '2px solid #00aff5', 
                            bgcolor: '#00aff5',
                            fontWeight: 600
                          }}
                        >
                          {(!trip.driver_profile?.avatar && trip.driver_username) ? trip.driver_username[0].toUpperCase() : null}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#424242' }}>{trip.driver_username || 'Nieznany'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonOutline sx={{ fontSize: '18px', color: '#00aff5' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#757575' }}>{trip.available_seats} wolne</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', ml: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, border: '2px solid white', fontSize: '10px', bgcolor: '#e0e0e0', color: '#757575' }} />
                          <Avatar sx={{ width: 30, height: 30, border: '2px solid white', ml: -1, bgcolor: '#f5f5f5', color: '#757575', fontSize: '12px' }}>+{trip.bookings?.length || 0}</Avatar>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                ))
              )}
              {!loading && searched && trips.length === 0 && (
                <Typography align="center" color="text.secondary">Brak wyników wyszukiwania.</Typography>
              )}
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
    </LocalizationProvider>
  );
};
