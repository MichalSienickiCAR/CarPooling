import React, { useState } from 'react';
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
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  Avatar,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowForward,
  CalendarToday,
  PersonOutline,
  Close as CloseIcon,
  Logout,
  Star,
  StarBorder,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useEffect } from 'react';
import { Trip, tripService, authService, favoriteRouteService, FavoriteRoute } from '../services/api';

const validationSchema = yup.object({
  start_location: yup.string(),
  end_location: yup.string(),
  date: yup.string(),
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
  const [sortBy, setSortBy] = useState('price');
  const [favoriteRoutes, setFavoriteRoutes] = useState<FavoriteRoute[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const [passengerCount, setPassengerCount] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
      date: '', // Puste - pokazuje przejazdy na najbliższy miesiąc
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
        // Wysyłamy datę tylko jeśli użytkownik ją podał (opcjonalne)
        if (values.date && values.date.trim()) {
          params.append('date', values.date.trim());
        }
        // Domyślnie backend pokaże przejazdy na najbliższy miesiąc

        const data = await tripService.searchTrips(params.toString());
        console.log('Search results from API:', data); // Debug
        console.log('Passenger count filter:', passengerCount); // Debug

        const filteredBySeats = data.filter((trip: Trip) => trip.available_seats >= passengerCount);
        console.log('After passenger count filter:', filteredBySeats); // Debug

        setTrips(filteredBySeats);
        if (filteredBySeats.length === 0) {
          if (data.length === 0) {
            enqueueSnackbar('Nie znaleziono przejazdów spełniających kryteria.', { variant: 'info' });
          } else {
            enqueueSnackbar(`Znaleziono ${data.length} przejazdów, ale żaden nie ma wystarczającej liczby miejsc (szukasz ${passengerCount} miejsc).`, { variant: 'warning' });
          }
        }
      } catch (error: any) {
        console.error('Search error:', error);
        enqueueSnackbar('Nie udało się wyszukać przejazdów.', { variant: 'error' });
        setTrips([]);
      } finally {
        setLoading(false);
      }
    },
  });

  const sortedTrips = [...trips].sort((a, b) => {
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

  const getDisplayDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return "Dzisiaj";
    return dateStr;
  };

  // Pobierz ulubione trasy przy załadowaniu komponentu
  useEffect(() => {
    const loadFavoriteRoutes = async () => {
      try {
        setLoadingFavorites(true);
        const routes = await favoriteRouteService.getFavoriteRoutes();
        setFavoriteRoutes(routes);
      } catch (error) {
        console.error('Error loading favorite routes:', error);
      } finally {
        setLoadingFavorites(false);
      }
    };
    loadFavoriteRoutes();
  }, []);

  // Sprawdź czy aktualna trasa jest już w ulubionych
  const isCurrentRouteFavorite = () => {
    if (!formik.values.start_location || !formik.values.end_location) return false;
    return favoriteRoutes.some(
      route =>
        route.start_location.toLowerCase().trim() === formik.values.start_location.toLowerCase().trim() &&
        route.end_location.toLowerCase().trim() === formik.values.end_location.toLowerCase().trim()
    );
  };

  // Zapisz aktualną trasę jako ulubioną
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

  // Usuń ulubioną trasę
  const handleDeleteFavorite = async (routeId: number) => {
    try {
      await favoriteRouteService.deleteFavoriteRoute(routeId);
      setFavoriteRoutes(favoriteRoutes.filter(route => route.id !== routeId));
      enqueueSnackbar('Trasa została usunięta z ulubionych.', { variant: 'info' });
    } catch (error) {
      enqueueSnackbar('Nie udało się usunąć trasy.', { variant: 'error' });
    }
  };

  // Użyj ulubionej trasy do wyszukiwania
  const handleUseFavoriteRoute = (route: FavoriteRoute) => {
    formik.setFieldValue('start_location', route.start_location);
    formik.setFieldValue('end_location', route.end_location);
    // Automatycznie wykonaj wyszukiwanie
    formik.handleSubmit();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>

      {/* Navbar */}
      <Box sx={{ bgcolor: '#e0e0e0', pb: 4 }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#000', ml: 4, cursor: 'pointer' }} onClick={() => navigate('/')}>
              Sheero
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button color="inherit" sx={{ textTransform: 'none' }} onClick={() => navigate('/search')}>
                Wyszukaj
              </Button>
              {/* Link do profilu */}
              <IconButton onClick={() => navigate('/profile')}>
                <Avatar
                  src="https://mui.com/static/images/avatar/1.jpg"
                  sx={{ width: 40, height: 40, border: '2px solid white' }}
                />
              </IconButton>
              <IconButton onClick={() => { authService.logout(); navigate('/login'); }} title="Wyloguj">
                <Logout />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Pasek Wyszukiwania */}
        <Container maxWidth="lg">
          <Paper
            component="form"
            onSubmit={formik.handleSubmit}
            elevation={0}
            sx={{
              p: '8px',
              borderRadius: '50px',
              bgcolor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: '0px 2px 10px rgba(0,0,0,0.05)',
              mx: 4,
              flexWrap: 'wrap'
            }}
          >
            <Paper sx={{ px: 2, py: 0.5, borderRadius: '30px', flex: 1.5, display: 'flex', alignItems: 'center', boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' }}>
              <TextField
                fullWidth placeholder="Miejsce wyjazdu" variant="standard"
                name="start_location" value={formik.values.start_location} onChange={formik.handleChange}
                InputProps={{ disableUnderline: true, endAdornment: formik.values.start_location && <IconButton size="small" onClick={() => formik.setFieldValue('start_location', '')}><CloseIcon fontSize="small" /></IconButton> }}
              />
            </Paper>

            <ArrowForward color="action" />

            <Paper sx={{ px: 2, py: 0.5, borderRadius: '30px', flex: 1.5, display: 'flex', alignItems: 'center', boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' }}>
              <TextField
                fullWidth placeholder="Miejsce docelowe" variant="standard"
                name="end_location" value={formik.values.end_location} onChange={formik.handleChange}
                InputProps={{ disableUnderline: true, endAdornment: formik.values.end_location && <IconButton size="small" onClick={() => formik.setFieldValue('end_location', '')}><CloseIcon fontSize="small" /></IconButton> }}
              />
            </Paper>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, px: 3, borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc', height: '30px' }}>
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1, color: '#424242', cursor: 'pointer' }}>
                <CalendarToday fontSize="small" sx={{ pointerEvents: 'none' }} />
                <Typography variant="body2" sx={{ whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                  {formik.values.date ? getDisplayDate(formik.values.date) : 'Najbliższy miesiąc'}
                </Typography>
                <TextField
                  type="date"
                  name="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  variant="standard"
                  InputProps={{ disableUnderline: true }}
                  sx={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    '& input': { cursor: 'pointer', height: '100%' }
                  }}
                />
              </Box>

              <Box
                onClick={handlePassengerClick}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#424242', cursor: 'pointer' }}
              >
                <PersonOutline />
                <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                  {passengerCount} {passengerCount === 1 ? 'pasażer' : 'pasażerów'}
                </Typography>
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handlePassengerClose}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <MenuItem key={num} onClick={() => handlePassengerSelect(num)}>
                    {num} {num === 1 ? 'pasażer' : 'pasażerów'}
                  </MenuItem>
                ))}
              </Menu>

            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={handleSaveAsFavorite}
                disabled={!formik.values.start_location || !formik.values.end_location}
                sx={{
                  color: isCurrentRouteFavorite() ? '#FFD700' : '#757575',
                  '&:hover': { color: '#FFD700' }
                }}
                title={isCurrentRouteFavorite() ? 'Trasa jest już w ulubionych' : 'Zapisz trasę jako ulubioną'}
              >
                {isCurrentRouteFavorite() ? <Star /> : <StarBorder />}
              </IconButton>

              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: '30px',
                  bgcolor: '#c62828',
                  px: 4, py: 1,
                  textTransform: 'none',
                  fontSize: '1rem',
                  minWidth: '120px',
                  '&:hover': { bgcolor: '#b71c1c' }
                }}
              >
                Szukaj
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6 }}>
          {/* Sidebar */}
          <Box sx={{ width: { xs: '100%', md: '25%' } }}>
            {/* Ulubione trasy */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '20px', bgcolor: '#f5f5f5' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#000' }}>
                  Ulubione trasy
                </Typography>
                <Star sx={{ color: '#FFD700', fontSize: '20px' }} />
              </Box>
              {loadingFavorites ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : favoriteRoutes.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  Brak ulubionych tras. Zapisz trasę klikając gwiazdkę przy wyszukiwaniu.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {favoriteRoutes.map((route) => (
                    <Paper
                      key={route.id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: '15px',
                        bgcolor: 'white',
                        cursor: 'pointer',
                        border: '1px solid #e0e0e0',
                        '&:hover': {
                          borderColor: '#c62828',
                          bgcolor: '#ffebee'
                        },
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box
                        onClick={() => handleUseFavoriteRoute(route)}
                        sx={{ flex: 1, minWidth: 0 }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {route.start_location}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {route.end_location}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (route.id) handleDeleteFavorite(route.id);
                        }}
                        sx={{ color: '#757575', '&:hover': { color: '#c62828' } }}
                        title="Usuń z ulubionych"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* Sortowanie */}
            <Typography variant="subtitle1" gutterBottom sx={{ color: '#757575', mb: 2 }}>Sortuj według</Typography>
            <RadioGroup value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <FormControlLabel value="time" control={<Radio color="default" size="small" />} label={<Typography variant="body2">Godziny odjazdu</Typography>} sx={{ mb: 1 }} />
              <FormControlLabel value="price" control={<Radio color="default" size="small" />} label={<Typography variant="body2">Ceny</Typography>} sx={{ mb: 1 }} />
              <FormControlLabel value="dist" control={<Radio color="default" size="small" />} label={<Typography variant="body2">Blisko miejsca wyjazdu</Typography>} sx={{ mb: 1 }} />
              <FormControlLabel value="duration" control={<Radio color="default" size="small" />} label={<Typography variant="body2">Najkrótszy przejazd</Typography>} sx={{ mb: 1 }} />
            </RadioGroup>
          </Box>

          {/* Results */}
          <Box sx={{ width: { xs: '100%', md: '75%' } }}>
            <Paper elevation={0} sx={{ bgcolor: '#e0e0e0', py: 1.5, px: 3, borderRadius: '20px', mb: 4, textAlign: 'center' }}>
              <Typography variant="body1">
                {loading ? 'Szukanie...' : `Wyszukało ${trips.length} przejazdy`}
              </Typography>
            </Paper>

            <Stack spacing={3}>
              {loading ? (
                <Box display="flex" justifyContent="center"><CircularProgress /></Box>
              ) : (
                sortedTrips.map((trip) => (
                  <Paper
                    key={trip.id}
                    elevation={0}
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    sx={{
                      borderRadius: '30px',
                      overflow: 'hidden',
                      border: '1px solid #eee',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'scale(1.01)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ width: '60%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, px: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{trip.time?.substring(0, 5)}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{getArrivalTime(trip.time)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#000' }}>
                          <Typography variant="body1">{trip.start_location}</Typography>
                          <ArrowForward fontSize="small" sx={{ color: '#000' }} />
                          <Typography variant="body1">{trip.end_location}</Typography>
                        </Box>
                      </Box>
                      <Box>{formatPrice(trip.price_per_seat)}</Box>
                    </Box>

                    <Box sx={{ bgcolor: '#dcdcdc', p: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={trip.driver_profile?.avatar || undefined}
                          sx={{ width: 40, height: 40, border: '2px solid white', bgcolor: '#c62828' }}
                        >
                          {(!trip.driver_profile?.avatar && trip.driver_username) ? trip.driver_username[0].toUpperCase() : null}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {trip.driver_username || 'Nieznany'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">Pasażerowie</Typography>
                        <Box sx={{ display: 'flex', ml: 1 }}>
                          <Avatar sx={{ width: 30, height: 30, border: '2px solid white', fontSize: '10px' }} />
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
  );
};
