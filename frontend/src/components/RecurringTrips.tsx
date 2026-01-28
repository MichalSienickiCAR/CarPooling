import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { recurringTripService, RecurringTrip } from '../services/recurringTrips';
import AddRecurringTrip from './AddRecurringTrip';

const RecurringTrips: React.FC = () => {
  const [trips, setTrips] = useState<RecurringTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTrip, setEditingTrip] = useState<RecurringTrip | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await recurringTripService.getRecurringTrips();
      setTrips(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Nie udało się pobrać cyklicznych przejazdów');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleAdd = () => {
    setEditingTrip(null);
    setOpenDialog(true);
  };

  const handleEdit = (trip: RecurringTrip) => {
    setEditingTrip(trip);
    setOpenDialog(true);
  };

  const handleDelete = async (tripId: number) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten cykliczny przejazd?')) return;

    try {
      await recurringTripService.deleteRecurringTrip(tripId);
      await loadTrips();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Nie udało się usunąć przejazdu');
    }
  };

  const handleToggleActive = async (trip: RecurringTrip) => {
    try {
      await recurringTripService.toggleActive(trip.id);
      await loadTrips();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Nie udało się zmienić statusu');
    }
  };

  const handleGenerate = async (tripId: number) => {
    try {
      setGeneratingId(tripId);
      const result = await recurringTripService.generateTrips(tripId, 30);
      alert(`Wygenerowano ${result.generated} przejazdów`);
      await loadTrips();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Nie udało się wygenerować przejazdów');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDialogClose = async (saved: boolean) => {
    setOpenDialog(false);
    setEditingTrip(null);
    if (saved) {
      await loadTrips();
    }
  };

  const getFrequencyLabel = (frequency: string): string => {
    const labels: { [key: string]: string } = {
      daily: 'Codziennie',
      weekly: 'Co tydzień',
      biweekly: 'Co 2 tygodnie',
      monthly: 'Co miesiąc',
    };
    return labels[frequency] || frequency;
  };

  const getWeekdaysLabel = (weekdays: number[]): string => {
    const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
    return weekdays.map((d) => dayNames[d]).join(', ');
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Cykliczne Przejazdy</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Dodaj Cykliczny Przejazd
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Trasa</TableCell>
              <TableCell>Częstotliwość</TableCell>
              <TableCell>Godzina</TableCell>
              <TableCell>Miejsca</TableCell>
              <TableCell>Cena</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data końca</TableCell>
              <TableCell align="right">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Brak cyklicznych przejazdów
                </TableCell>
              </TableRow>
            ) : (
              trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell>
                    <Typography variant="body2">
                      {trip.start_location} → {trip.end_location}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{getFrequencyLabel(trip.frequency)}</Typography>
                      {(trip.frequency === 'weekly' || trip.frequency === 'biweekly') && (
                        <Typography variant="caption" color="text.secondary">
                          {getWeekdaysLabel(trip.weekdays)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{trip.time}</TableCell>
                  <TableCell>{trip.available_seats}</TableCell>
                  <TableCell>{trip.price_per_seat} PLN</TableCell>
                  <TableCell>
                    <Chip
                      label={trip.active ? 'Aktywny' : 'Nieaktywny'}
                      color={trip.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{trip.end_date || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleToggleActive(trip)}
                      title={trip.active ? 'Dezaktywuj' : 'Aktywuj'}
                    >
                      {trip.active ? <PauseIcon /> : <PlayIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleGenerate(trip.id)}
                      disabled={generatingId === trip.id || !trip.active}
                      title="Generuj przejazdy"
                    >
                      {generatingId === trip.id ? <CircularProgress size={20} /> : <RefreshIcon />}
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={() => handleEdit(trip)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(trip.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => handleDialogClose(false)} maxWidth="md" fullWidth>
        <AddRecurringTrip trip={editingTrip} onClose={handleDialogClose} />
      </Dialog>
    </Container>
  );
};

export default RecurringTrips;
