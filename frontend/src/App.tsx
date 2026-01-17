import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { SearchTrips } from './components/SearchTrips';
import { DriverDashboard } from './components/DriverDashboard';
import { PassengerDashboard } from './components/PassengerDashboard';
import { AddTrip } from './components/AddTrip';
import { MyTrips } from './components/MyTrips';
import MyBookings from './components/MyBookings';
import { TripDetails } from './components/TripDetails';
import Wallet from './components/Wallet';
import { UserProfile } from './components/UserProfile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SearchPage } from './components/SearchPage';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider 
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={3000}
      >
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public homepage */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/search" element={<SearchTrips />} />
            <Route path="/trips/:id" element={<TripDetails />} />

            {/* Authenticated routes */}
            <Route element={<ProtectedRoute />}> 
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/driver" element={<DriverDashboard />} />
              <Route path="/passenger" element={<PassengerDashboard />} />
              <Route path="/trips/add" element={<AddTrip />} />
              <Route path="/trips/mine" element={<MyTrips />} />
              <Route path="/bookings/my" element={<MyBookings />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>
          </Routes>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
