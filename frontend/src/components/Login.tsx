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
  Avatar,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const validationSchema = yup.object({
  username: yup
    .string()
    .required('Username is required'),
  password: yup
    .string()
    .required('Password is required'),
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
        enqueueSnackbar('Logowanie zakończone pomyślnie!', { 
          variant: 'success',
        });
        navigate('/dashboard');
      } catch (error) {
        enqueueSnackbar('Nieprawidłowa nazwa użytkownika lub hasło.', { 
          variant: 'error',
        });
        console.error('Login failed:', error);
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
          }}
        >
          <Avatar sx={{ 
            m: 1, 
            bgcolor: 'primary.main',
            width: 56,
            height: 56,
          }}>
            <LockOutlined fontSize="large" />
          </Avatar>
          <Typography 
            component="h1" 
            variant="h5"
            sx={{ 
              mb: 3,
              fontWeight: 600,
              background: 'linear-gradient(45deg, #1976d2, #2196f3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Zaloguj się
          </Typography>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              id="username"
              name="username"
              label="Username"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              autoComplete="username"
              autoFocus
            />
            <TextField
              margin="normal"
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                height: 46,
                background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                }
              }}
            >
              Zaloguj się
            </Button>
            <Box sx={{ 
              textAlign: 'center',
              mt: 2
            }}>
              <Link 
                href="/register" 
                variant="body2"
                sx={{
                  textDecoration: 'none',
                  color: 'primary.main',
                  '&:hover': {
                    color: 'primary.dark',
                    textDecoration: 'underline',
                  }
                }}
              >
                Nie masz konta? Zarejestruj się
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};