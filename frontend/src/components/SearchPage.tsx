import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export const SearchPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <Container>
        <Typography variant="h4" gutterBottom>
          Wyszukiwarka przejazdów
        </Typography>
        <Typography color="text.secondary">
          Sekcja w trakcie scalania. Wkrótce tutaj pojawi się pełna wyszukiwarka.
        </Typography>
      </Container>
    </Box>
  );
};
