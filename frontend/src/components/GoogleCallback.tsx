import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Container, Paper, Typography } from '@mui/material';
import { api, authService } from '../services/api';
import { useSnackbar } from 'notistack';

export const GoogleCallback: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const run = async () => {
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        enqueueSnackbar(`Google OAuth error: ${error}`, { variant: 'error' });
        navigate('/login');
        return;
      }

      if (!code) {
        enqueueSnackbar('Brak kodu autoryzacyjnego z Google.', { variant: 'error' });
        navigate('/login');
        return;
      }

      try {
        const resp = await api.post('/auth/google/callback/', { code });
        if (resp.data?.access) {
          localStorage.setItem('token', resp.data.access);
          localStorage.setItem('refreshToken', resp.data.refresh);
        }

        // Ustaw rolę (RoleProtectedRoute i dashboard i tak pobierają profil)
        await authService.getUserProfile().catch(() => null);

        enqueueSnackbar('Zalogowano przez Google!', { variant: 'success' });
        navigate('/dashboard');
      } catch (e: any) {
        const msg = e?.response?.data?.error || 'Nie udało się zalogować przez Google.';
        enqueueSnackbar(msg, { variant: 'error' });
        navigate('/login');
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            padding: 4,
            width: '100%',
            border: '1px solid #e0e0e0',
            borderRadius: '20px',
            textAlign: 'center',
          }}
        >
          <CircularProgress sx={{ color: '#00aff5' }} />
          <Typography sx={{ mt: 2, fontWeight: 600 }}>
            Kończę logowanie przez Google…
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

