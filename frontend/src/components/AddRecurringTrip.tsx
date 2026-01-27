import React, { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Stack,
} from '@mui/material';
import { recurringTripService, RecurringTrip, CreateRecurringTripData } from '../services/recurringTrips';

interface AddRecurringTripProps {
  trip?: RecurringTrip | null;
  onClose: (saved: boolean) => void;
}

const AddRecurringTrip: React.FC<AddRecurringTripProps> = ({ trip, onClose }) => {
  const [formData, setFormData] = useState<CreateRecurringTripData>({
    frequency: trip?.frequency || 'weekly',
    weekdays: trip?.weekdays || [],
    start_location: trip?.start_location || '',
    end_location: trip?.end_location || '',
    intermediate_stops: trip?.intermediate_stops || [],
    time: trip?.time || '',
    available_seats: trip?.available_seats || 1,
    price_per_seat: trip?.price_per_seat || '',
    start_date: trip?.start_date || '',
    end_date: trip?.end_date || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const weekdayNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

  const handleChange = (field: keyof CreateRecurringTripData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleWeekdayToggle = (dayIndex: number) => {
    const currentWeekdays = formData.weekdays || [];
    const newWeekdays = currentWeekdays.includes(dayIndex)
      ? currentWeekdays.filter((d) => d !== dayIndex)
      : [...currentWeekdays, dayIndex].sort();
    setFormData({ ...formData, weekdays: newWeekdays });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (trip) {
        await recurringTripService.updateRecurringTrip(trip.id, formData);
      } else {
        await recurringTripService.createRecurringTrip(formData);
      }
      onClose(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Wystąpił błąd podczas zapisu');
      setLoading(false);
    }
  };

  const showWeekdays = formData.frequency === 'weekly' || formData.frequency === 'biweekly';

  return (
    <>
      <DialogTitle>{trip ? 'Edytuj Cykliczny Przejazd' : 'Dodaj Cykliczny Przejazd'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Punkt początkowy"
                value={formData.start_location}
                onChange={handleChange('start_location')}
                required
              />
              <TextField
                fullWidth
                label="Punkt końcowy"
                value={formData.end_location}
                onChange={handleChange('end_location')}
                required
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Częstotliwość</InputLabel>
                <Select value={formData.frequency} onChange={handleChange('frequency')} label="Częstotliwość">
                  <MenuItem value="daily">Codziennie</MenuItem>
                  <MenuItem value="weekly">Co tydzień</MenuItem>
                  <MenuItem value="biweekly">Co 2 tygodnie</MenuItem>
                  <MenuItem value="monthly">Co miesiąc</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Godzina"
                type="time"
                value={formData.time}
                onChange={handleChange('time')}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Stack>

            {showWeekdays && (
              <Box>
                <FormGroup row>
                  {weekdayNames.map((name, index) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          checked={(formData.weekdays || []).includes(index)}
                          onChange={() => handleWeekdayToggle(index)}
                        />
                      }
                      label={name}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Dostępne miejsca"
                type="number"
                value={formData.available_seats}
                onChange={handleChange('available_seats')}
                inputProps={{ min: 1 }}
                required
              />

              <TextField
                fullWidth
                label="Cena za miejsce (PLN)"
                type="number"
                value={formData.price_per_seat}
                onChange={handleChange('price_per_seat')}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />

              <TextField
                fullWidth
                label="Data rozpoczęcia"
                type="date"
                value={formData.start_date}
                onChange={handleChange('start_date')}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Stack>

            <TextField
              fullWidth
              label="Data zakończenia (opcjonalnie)"
              type="date"
              value={formData.end_date}
              onChange={handleChange('end_date')}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(false)} disabled={loading}>
            Anuluj
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default AddRecurringTrip;
