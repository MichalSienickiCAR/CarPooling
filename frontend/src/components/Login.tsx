import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Paper,
} from '@mui/material';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const validationSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await authService.login(values.username, values.password);

        try {
          const profile = await authService.getUserProfile();
          localStorage.setItem('userRole', profile.preferred_role);

          if (profile.preferred_role === 'driver') {
            navigate('/driver');
          } else if (profile.preferred_role === 'passenger') {
            navigate('/passenger');
          } else {
            navigate('/dashboard');
          }
        } catch (profileError) {
          console.warn('Could not fetch user profile:', profileError);
          navigate('/dashboard');
        }

        enqueueSnackbar('Logowanie zakończone pomyślnie!', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Nieprawidłowa nazwa użytkownika lub hasło.', { variant: 'error' });
        console.error('Login failed:', error);
      }
    },
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 'bold', color: '#000', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Sheero
        </Typography>
        <Button color="inherit" onClick={() => navigate('/register')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
          Zarejestruj się
        </Button>
      </Box>

      <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pb: 8 }}>
        <Paper elevation={0} sx={{ bgcolor: '#f5f5f5', p: { xs: 3, md: 6 }, borderRadius: '40px', width: '100%' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>Witaj ponownie</Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: '#757575' }}>Zaloguj się, aby kontynuować</Typography>

          <Box component="form" onSubmit={formik.handleSubmit}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ ml: 1, mb: 1, fontWeight: 'bold', color: '#424242' }}>Login</Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Wpisz login"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                // helperText={formik.touched.username && formik.errors.username}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    bgcolor: 'white',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: '#e0e0e0' },
                    '&.Mui-focused fieldset': { borderColor: '#c62828' }
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ ml: 1, mb: 1, fontWeight: 'bold', color: '#424242' }}>Hasło</Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Wpisz hasło"
                type="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                // helperText={formik.touched.password && formik.errors.password}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    bgcolor: 'white',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: '#e0e0e0' },
                    '&.Mui-focused fieldset': { borderColor: '#c62828' }
                  }
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                bgcolor: '#c62828',
                borderRadius: '30px',
                py: 1.5,
                mt: 1,
                fontSize: '1.rem',
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#b71c1c', boxShadow: 'none' }
              }}
            >
              Zaloguj się
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};