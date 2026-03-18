import React, { useMemo, useState } from 'react';
import { Box, Button, Link, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const STORAGE_KEY = 'cookie_consent_v1';

type ConsentValue = {
  acceptedAt: string; // ISO
};

function readConsent(): ConsentValue | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentValue;
    if (!parsed?.acceptedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent() {
  const payload: ConsentValue = { acceptedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export const CookieBanner: React.FC = () => {
  const initial = useMemo(() => readConsent(), []);
  const [visible, setVisible] = useState(!initial);

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 980,
          mx: 'auto',
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Cookies
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Używamy cookies, aby zapewnić poprawne działanie aplikacji. Akceptując, zgadzasz się na ich użycie.
              {' '}
              <Link component={RouterLink} to="/polityka-prywatnosci" underline="hover">
                Polityka prywatności
              </Link>
              {' '}
              i
              {' '}
              <Link component={RouterLink} to="/regulamin" underline="hover">
                Regulamin
              </Link>
              .
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              onClick={() => {
                writeConsent();
                setVisible(false);
              }}
              sx={{ borderRadius: 999, px: 3, py: 1.1, fontWeight: 700 }}
            >
              Akceptuj wszystko
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

