import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const validationSchema = yup.object({
  username: yup.string().min(3, 'Minimum 3 znaki').required('Wymagane'),
  email: yup.string().email('Nieprawidłowy email').required('Wymagane'),
  password: yup.string().min(8, 'Minimum 8 znaków').required('Wymagane'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Hasła muszą być identyczne').required('Wymagane'),
  preferredRole: yup.string().oneOf(['driver', 'passenger', 'both']).required('Wymagane'),
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
      preferredRole: 'both' as 'driver' | 'passenger' | 'both',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await authService.register(values.username, values.email, values.password, values.preferredRole);
        enqueueSnackbar('Rejestracja zakończona pomyślnie! Możesz się teraz zalogować.', { variant: 'success' });
        navigate('/login');
      } catch (error) {
        enqueueSnackbar('Wystąpił błąd podczas rejestracji.', { variant: 'error' });
        console.error('Registration failed:', error);
      }
    },
  });

  const CustomInput = (props: any) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ ml: 1, mb: 1, fontWeight: 'bold', color: '#424242' }}>{props.label}</Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={props.placeholder}
        {...props}
        label={null}
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
  );

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
        <Button color="inherit" onClick={() => navigate('/login')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
          Zaloguj się
        </Button>
      </Box>

      <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pb: 8 }}>
        <Paper elevation={0} sx={{ bgcolor: '#f5f5f5', p: { xs: 3, md: 6 }, borderRadius: '40px', width: '100%' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>Dołącz do nas</Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: '#757575' }}>Utwórz nowe konto</Typography>

          <Box component="form" onSubmit={formik.handleSubmit}>
            <CustomInput
              label="Nazwa użytkownika" placeholder="Twój login"
              name="username" value={formik.values.username} onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
            // helperText={formik.touched.username && formik.errors.username}
            />
            <CustomInput
              label="Email" placeholder="twoj@email.com"
              name="email" value={formik.values.email} onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
            />
            <CustomInput
              label="Hasło" placeholder="Minimum 8 znaków" type="password"
              name="password" value={formik.values.password} onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
            />
            <CustomInput
              label="Powtórz hasło" placeholder="Powtórz hasło" type="password"
              name="confirmPassword" value={formik.values.confirmPassword} onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            />

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ ml: 1, mb: 1, fontWeight: 'bold', color: '#424242' }}>Chcę być</Typography>
              <RadioGroup row name="preferredRole" value={formik.values.preferredRole} onChange={formik.handleChange} sx={{ justifyContent: 'space-between' }}>
                {['driver', 'passenger', 'both'].map((role) => (
                  <FormControlLabel
                    key={role}
                    value={role}
                    control={<Radio sx={{ display: 'none' }} />}
                    label={
                      <Box sx={{
                        px: 3, py: 1.5, borderRadius: '20px',
                        bgcolor: formik.values.preferredRole === role ? '#c62828' : 'white',
                        color: formik.values.preferredRole === role ? 'white' : '#757575',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        {role === 'driver' ? 'Kierowcą' : role === 'passenger' ? 'Pasażerem' : 'Oba'}
                      </Box>
                    }
                    sx={{ m: 0 }}
                  />
                ))}
              </RadioGroup>
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
              Zarejestruj się
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};