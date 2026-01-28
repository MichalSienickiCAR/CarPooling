import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Typography,
} from '@mui/material';
import { waitlistService, JoinWaitlistData } from '../services/waitlist';

interface WaitlistDialogProps {
  open: boolean;
  tripId: number;
  maxSeats: number;
  onClose: () => void;
  onSuccess: () => void;
}

const WaitlistDialog: React.FC<WaitlistDialogProps> = ({ open, tripId, maxSeats, onClose, onSuccess }) => {
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data: JoinWaitlistData = {
        trip: tripId,
        seats_requested: seatsRequested,
      };
      await waitlistService.joinWaitlist(data);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Nie udało się zapisać na listę oczekujących');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSeatsRequested(1);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Zapisz się na listę oczekujących</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" sx={{ mb: 2 }}>
            Ten przejazd jest obecnie pełny. Możesz zapisać się na listę oczekujących. Otrzymasz powiadomienie, gdy
            miejsce się zwolni.
          </Typography>

          <TextField
            fullWidth
            label="Liczba miejsc"
            type="number"
            value={seatsRequested}
            onChange={(e) => setSeatsRequested(parseInt(e.target.value) || 1)}
            inputProps={{ min: 1, max: maxSeats }}
            required
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Anuluj
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Zapisywanie...' : 'Zapisz się'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default WaitlistDialog;
