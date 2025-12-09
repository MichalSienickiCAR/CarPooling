import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { PassengerDashboard } from './components/PassengerDashboard';
import { SearchTrips } from './components/SearchTrips';
import { AddTrip } from './components/AddTrip';
import { MyTrips } from './components/MyTrips';
import { LandingPage } from './components/LandingPage';
import { UserProfile } from './components/UserProfile';
import { TripDetails } from './components/TripDetails';
import { ProtectedRoute } from './components/ProtectedRoute'; // Import ProtectedRoute
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';

const theme = createTheme({
  palette: {
    primary: {
      main: '#c62828', // Red from mockup
      light: '#ff5f52',
      dark: '#8e0000',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#fff', // White background
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
            <Route path="/" element={<LandingPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/driver" element={<DriverDashboard />} />
              <Route path="/passenger" element={<PassengerDashboard />} />
              <Route path="/search" element={<SearchTrips />} />
              <Route path="/trips/add" element={<AddTrip />} />
              <Route path="/trips/mine" element={<MyTrips />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/trips/:id" element={<TripDetails />} />
            </Route>
          </Routes>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
