import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import Friends from './components/Friends';
import TrustedUsers from './components/TrustedUsers';
import { History } from './components/History';
import Reviews from './components/Reviews';
import RecurringTrips from './components/RecurringTrips';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { GoogleCallback } from './components/GoogleCallback';
import { CookieBanner } from './components/CookieBanner';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Terms } from './components/Terms';

const THEME_STORAGE_KEY = 'theme_mode_v1';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return raw === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    const onThemeChange = () => {
      const raw = localStorage.getItem(THEME_STORAGE_KEY);
      setMode(raw === 'dark' ? 'dark' : 'light');
    };
    window.addEventListener('app-theme-change', onThemeChange as EventListener);
    window.addEventListener('storage', onThemeChange);
    return () => {
      window.removeEventListener('app-theme-change', onThemeChange as EventListener);
      window.removeEventListener('storage', onThemeChange);
    };
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#00aff5',
            light: '#33bff7',
            dark: '#0099d6',
          },
          secondary: {
            main: '#34a853',
            light: '#5cb574',
            dark: '#2d8e46',
          },
          background: {
            default: mode === 'dark' ? '#0b0f14' : '#f8f9fa',
            paper: mode === 'dark' ? '#121822' : '#ffffff',
          },
          text: mode === 'dark'
            ? { primary: '#e6edf3', secondary: '#a8b3c2' }
            : { primary: '#1a1a1a', secondary: '#666666' },
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
          h1: { fontWeight: 700 },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 700 },
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                textTransform: 'none',
                fontWeight: 600,
                padding: '10px 24px',
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': { borderRadius: 12 },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: { borderRadius: 16 },
            },
          },
        },
      }),
    [mode],
  );

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
          <CookieBanner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />

            {/* Public homepage */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/search" element={<SearchTrips />} />
            <Route path="/trips/:id" element={<TripDetails />} />
            <Route path="/polityka-prywatnosci" element={<PrivacyPolicy />} />
            <Route path="/regulamin" element={<Terms />} />

            {/* Authenticated routes */}
            <Route element={<ProtectedRoute />}> 
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/trusted-users" element={<TrustedUsers />} />
              <Route path="/history" element={<History />} />
              <Route path="/reviews" element={<Reviews />} />
            </Route>

            {/* Driver-only routes */}
            <Route element={<RoleProtectedRoute allowedRole="driver" />}>
              <Route path="/driver" element={<DriverDashboard />} />
              <Route path="/trips/add" element={<AddTrip />} />
              <Route path="/trips/mine" element={<MyTrips />} />
              <Route path="/recurring-trips" element={<RecurringTrips />} />
            </Route>

            {/* Passenger-only routes */}
            <Route element={<RoleProtectedRoute allowedRole="passenger" />}>
              <Route path="/passenger" element={<PassengerDashboard />} />
              <Route path="/bookings/my" element={<MyBookings />} />
            </Route>
          </Routes>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
