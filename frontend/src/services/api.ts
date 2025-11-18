import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Do not attach Authorization header for auth endpoints (login/register/refresh).
  // If a stale/invalid token is present in localStorage it can cause the server
  // to attempt authentication and return 401 before the view's AllowAny
  // permission is evaluated.
  const skipAuthPaths = ['/token/', '/token/refresh/', '/user/register/'];
  const url = config.url || '';
  const shouldSkip = skipAuthPaths.some((p) => url.endsWith(p));
  if (shouldSkip) return config;

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(username: string, password: string) {
    const response = await api.post('/token/', { username, password });
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
    }
    return response.data;
  },

  async register(username: string, email: string, password: string) {
    const response = await api.post('/user/register/', { username, email, password });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const response = await api.post('/token/refresh/', {
        refresh: refreshToken,
      });
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
      }
      return response.data;
    }
    return null;
  },
};

export interface Trip {
  id?: number;
  driver?: number;
  driver_username?: string;
  start_location: string;
  end_location: string;
  intermediate_stops: string[];
  date: string;
  time: string;
  available_seats: number;
  price_per_seat: number;
  created_at?: string;
  updated_at?: string;
  bookings?: Booking[];
}

export interface Booking {
  id: number;
  passenger: number;
  passenger_username: string;
  seats: number;
  status: string;
  created_at: string;
}

export interface TripFormData {
  start_location: string;
  end_location: string;
  intermediate_stops: string[];
  date: string;
  time: string;
  available_seats: number;
  price_per_seat: number;
}

export const tripService = {
  async createTrip(tripData: TripFormData) {
    const response = await api.post('/trips/', tripData);
    return response.data;
  },

  async getTrips() {
    const response = await api.get('/trips/');
    return response.data;
  },

  async getMyTrips() {
    const response = await api.get('/trips/my_trips/');
    return response.data;
  },

  async searchTrips(queryParams: string) {
    const response = await api.get(`/trips/search/?${queryParams}`);
    return response.data;
  },

  async updateTrip(tripId: number, tripData: TripFormData) {
    const response = await api.patch(`/trips/${tripId}/`, tripData);
    return response.data;
  },

  async cancelTrip(tripId: number) {
    const response = await api.post(`/trips/${tripId}/cancel/`);
    return response.data;
  },

  async getPassengers(tripId: number) {
    const response = await api.get(`/trips/${tripId}/passengers/`);
    return response.data as Booking[];
  },
};