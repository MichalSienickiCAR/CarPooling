import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

export const Terms: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Regulamin
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Placeholder. Treść regulaminu zostanie uzupełniona.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

