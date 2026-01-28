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
import { GoogleLoginButton } from './GoogleLoginButton';

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
          elevation={0}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            background: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: '20px',
          }}
        >
          <Avatar sx={{ 
            m: 1, 
            bgcolor: '#00aff5',
            width: 64,
            height: 64,
          }}>
            <LockOutlined fontSize="large" />
          </Avatar>
          <Typography 
            component="h1" 
            variant="h4"
            sx={{ 
              mb: 1,
              fontWeight: 700,
              color: '#1a1a1a',
            }}
          >
            Zaloguj się
          </Typography>
          <Typography 
            variant="body1"
            sx={{ 
              mb: 4,
              color: '#666',
              textAlign: 'center',
            }}
          >
            Witamy z powrotem w Sheero
          </Typography>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              fullWidth
              id="username"
              name="username"
              label="Nazwa użytkownika"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              autoComplete="username"
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              id="password"
              name="password"
              label="Hasło"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              autoComplete="current-password"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                height: 52,
                borderRadius: '12px',
                backgroundColor: '#00aff5',
                fontSize: '16px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0, 175, 245, 0.3)',
                '&:hover': {
                  backgroundColor: '#0099d6',
                  boxShadow: '0 6px 16px rgba(0, 175, 245, 0.4)',
                }
              }}
            >
              Zaloguj się
            </Button>

            <GoogleLoginButton />
            <Box sx={{ 
              textAlign: 'center',
              mt: 2
            }}>
              <Link 
                href="/register" 
                variant="body2"
                sx={{
                  textDecoration: 'none',
                  color: '#00aff5',
                  fontWeight: 600,
                  '&:hover': {
                    color: '#0099d6',
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