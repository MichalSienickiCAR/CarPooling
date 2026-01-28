import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { api } from '../services/api';
import { useSnackbar } from 'notistack';

export const GoogleLoginButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/google/');
      const authUrl = response.data?.auth_url;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        throw new Error('Brak auth_url z backendu');
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        'Nie udało się rozpocząć logowania Google.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={handleGoogleLogin}
      disabled={loading}
      sx={{
        mt: 1,
        height: 52,
        borderRadius: '12px',
        textTransform: 'none',
        fontWeight: 700,
      }}
    >
      {loading ? <CircularProgress size={22} /> : 'Zaloguj przez Google'}
    </Button>
  );
};

