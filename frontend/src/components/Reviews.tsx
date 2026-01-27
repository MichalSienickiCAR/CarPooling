import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tab,
  Tabs,
  Rating,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Star, PersonOutline, DriveEta } from '@mui/icons-material';
import { Review, reviewService } from '../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';

dayjs.locale('pl');

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Reviews: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [givenReviews, setGivenReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const [received, given] = await Promise.all([
        reviewService.getReceivedReviews(),
        reviewService.getMyReviews(),
      ]);
      setReceivedReviews(received);
      setGivenReviews(given);
    } catch (err: any) {
      console.error('Error loading reviews:', err);
      setError('Nie udało się załadować recenzji.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const calculateAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const renderReviewCard = (review: Review, isReceived: boolean) => (
    <Card key={review.id} sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonOutline />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {isReceived ? review.reviewer_username : review.reviewed_user_username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dayjs(review.created_at).format('DD MMMM YYYY, HH:mm')}
              </Typography>
            </Box>
          </Box>
          <Rating value={review.rating} readOnly size="large" />
        </Box>

        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <DriveEta fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Przejazd: {review.trip_info.start_location} → {review.trip_info.end_location}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {dayjs(review.trip_info.date).format('DD MMMM YYYY')}
            {review.trip_info.time && `, ${review.trip_info.time}`}
          </Typography>
        </Box>

        {review.comment && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ fontStyle: review.comment ? 'normal' : 'italic' }}>
              {review.comment || 'Brak komentarza'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Star color="primary" />
          Moje Recenzje
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="reviews tabs">
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Otrzymane ({receivedReviews.length})
                  <Chip
                    label={calculateAverageRating(receivedReviews).toFixed(1)}
                    size="small"
                    color="primary"
                    icon={<Star fontSize="small" />}
                  />
                </Box>
              }
            />
            <Tab label={`Wystawione (${givenReviews.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {receivedReviews.length === 0 ? (
            <Alert severity="info">Nie masz jeszcze żadnych recenzji.</Alert>
          ) : (
            <>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={calculateAverageRating(receivedReviews)} precision={0.1} readOnly size="large" />
                  <span>{calculateAverageRating(receivedReviews).toFixed(1)}</span>
                  <Typography variant="body2" color="text.secondary">
                    ({receivedReviews.length} {receivedReviews.length === 1 ? 'recenzja' : 'recenzji'})
                  </Typography>
                </Typography>
              </Box>
              {receivedReviews.map((review) => renderReviewCard(review, true))}
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {givenReviews.length === 0 ? (
            <Alert severity="info">Nie wystawiłeś jeszcze żadnych recenzji.</Alert>
          ) : (
            givenReviews.map((review) => renderReviewCard(review, false))
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Reviews;
