import React, { useState } from 'react';
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
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Chip,
} from '@mui/material';
import { PersonAddOutlined, DirectionsCar, PersonOutline } from '@mui/icons-material';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const validationSchema = yup.object({
  username: yup
    .string()
    .min(3, 'Nazwa użytkownika powinna mieć minimum 3 znaki')
    .required('Nazwa użytkownika jest wymagana'),
  email: yup
    .string()
    .email('Wprowadź poprawny adres email')
    .required('Email jest wymagany'),
  password: yup
    .string()
    .min(8, 'Hasło powinno mieć minimum 8 znaków')
    .required('Hasło jest wymagane'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Hasła muszą być takie same')
    .required('Potwierdzenie hasła jest wymagane'),
  role: yup
    .string()
    .oneOf(['driver', 'passenger'], 'Musisz wybrać rolę')
    .required('Wybór roli jest wymagany'),
});

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '' as 'driver' | 'passenger' | '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await authService.register(
          values.username, 
          values.email, 
          values.password, 
          values.role as 'driver' | 'passenger'
        );
        enqueueSnackbar('Rejestracja zakończona pomyślnie! Możesz się teraz zalogować.', { 
          variant: 'success',
        });
        navigate('/login');
      } catch (error) {
        enqueueSnackbar('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.', { 
          variant: 'error',
        });
        console.error('Registration failed:', error);
      }
    },
  });

  const handleRoleChange = (
    event: React.MouseEvent<HTMLElement>,
    newRole: 'driver' | 'passenger' | null,
  ) => {
    if (newRole !== null) {
      formik.setFieldValue('role', newRole);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
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
            <PersonAddOutlined fontSize="large" />
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
            Dołącz do Sheero
          </Typography>
          <Typography 
            variant="body1"
            sx={{ 
              mb: 4,
              color: '#666',
              textAlign: 'center',
            }}
          >
            Twórz wspólne przejazdy lub znajdź miejsce dla siebie
          </Typography>

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {/* Wybór roli */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: '#1a1a1a',
                  textAlign: 'center'
                }}
              >
                Wybierz swoją rolę
              </Typography>
              <ToggleButtonGroup
                value={formik.values.role}
                exclusive
                onChange={handleRoleChange}
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    borderRadius: '12px',
                    border: '2px solid #e0e0e0',
                    padding: '16px',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&.Mui-selected': {
                      backgroundColor: '#00aff5',
                      color: '#fff',
                      border: '2px solid #00aff5',
                      '&:hover': {
                        backgroundColor: '#0099d6',
                      },
                    },
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  },
                }}
              >
                <ToggleButton value="driver" sx={{ mr: 2 }}>
                  <Stack direction="column" alignItems="center" spacing={1}>
                    <DirectionsCar fontSize="large" />
                    <Typography variant="body1" fontWeight={600}>Kierowca</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Oferuję przejazdy
                    </Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="passenger">
                  <Stack direction="column" alignItems="center" spacing={1}>
                    <PersonOutline fontSize="large" />
                    <Typography variant="body1" fontWeight={600}>Pasażer</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Szukam przejazdu
                    </Typography>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
              {formik.touched.role && formik.errors.role && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {formik.errors.role}
                </Typography>
              )}
            </Box>

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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              id="email"
              name="email"
              label="Adres email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              autoComplete="email"
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
              autoComplete="new-password"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Potwierdź hasło"
              type="password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              autoComplete="new-password"
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
              disabled={!formik.values.role}
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
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                },
              }}
            >
              Zarejestruj się
            </Button>
            <Box sx={{ 
              textAlign: 'center',
              mt: 2
            }}>
              <Link 
                href="/login" 
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
                Masz już konto? Zaloguj się
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};