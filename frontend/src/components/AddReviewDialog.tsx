import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  Alert,
  Avatar,
} from '@mui/material';
import { Star, PersonOutline } from '@mui/icons-material';
import { reviewService, CreateReviewData } from '../services/api';

interface AddReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onReviewAdded?: () => void;
  tripId: number;
  reviewedUserId: number;
  reviewedUsername: string;
  bookingId?: number;
  tripRoute?: string;
}

const AddReviewDialog: React.FC<AddReviewDialogProps> = ({
  open,
  onClose,
  onReviewAdded,
  tripId,
  reviewedUserId,
  reviewedUsername,
  bookingId,
  tripRoute,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rating || rating < 1 || rating > 5) {
      setError('Proszę wybrać ocenę od 1 do 5 gwiazdek.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const reviewData: CreateReviewData = {
        reviewed_user: reviewedUserId,
        trip: tripId,
        rating,
        comment: comment.trim(),
      };

      if (bookingId) {
        reviewData.booking = bookingId;
      }

      await reviewService.createReview(reviewData);
      
      if (onReviewAdded) {
        onReviewAdded();
      }
      
      handleClose();
    } catch (err: any) {
      console.error('Error creating review:', err);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || 'Nie udało się dodać recenzji. Sprawdź czy nie oceniłeś już tego użytkownika za ten przejazd.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(null);
    setComment('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Star color="primary" />
        Wystaw recenzję
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonOutline />
            </Avatar>
            <Typography variant="h6">{reviewedUsername}</Typography>
          </Box>
          {tripRoute && (
            <Typography variant="body2" color="text.secondary">
              Przejazd: {tripRoute}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography component="legend" sx={{ mb: 1 }}>
            Ocena <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Rating
            name="rating"
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            size="large"
            sx={{ fontSize: '3rem' }}
          />
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Komentarz (opcjonalnie)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Opisz swoje doświadczenie z tym użytkownikiem..."
          inputProps={{ maxLength: 500 }}
          helperText={`${comment.length}/500 znaków`}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Anuluj
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !rating}
          startIcon={<Star />}
        >
          {loading ? 'Dodawanie...' : 'Wystaw recenzję'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddReviewDialog;
