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

export interface UserProfile {
  preferred_role: 'driver' | 'passenger' | 'both';
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  avatar?: string | null;
  notifications_enabled?: boolean;
}

export const authService = {
  async login(username: string, password: string) {
    const response = await api.post('/token/', { username, password });
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
    }
    return response.data;
  },

  async register(username: string, email: string, password: string, preferredRole: 'driver' | 'passenger' | 'both' = 'both') {
    const response = await api.post('/user/register/', {
      username,
      email,
      password,
      preferred_role: preferredRole
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
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

  async getUserProfile(): Promise<UserProfile> {
    const response = await api.get('/user/profile/');
    return response.data;
  },

  async updateUserProfile(data: Partial<UserProfile> | FormData): Promise<UserProfile> {
    const config = {
      headers: {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    };
    const response = await api.patch('/user/profile/', data, config);
    return response.data;
  },
};

export interface DriverProfile {
  username: string;
  first_name?: string;
  last_name?: string;
  avatar?: string | null;
  phone_number?: string;
}

export interface Trip {
  id?: number;
  driver?: number;
  driver_username?: string;
  driver_profile?: DriverProfile;
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

export interface TripDetails {
  id: number;
  start_location: string;
  end_location: string;
  date: string;
  time: string | null;
  price_per_seat: string;
  driver_username: string;
  driver_profile: {
    username: string;
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
  } | null;
}

export interface Booking {
  id: number;
  passenger: number;
  passenger_username: string;
  seats: number;
  status: string;
  paid_at?: string | null;
  created_at: string;
  trip_details: TripDetails | null;
}

export interface FavoriteRoute {
  id?: number;
  start_location: string;
  end_location: string;
  created_at?: string;
}

export interface TripTemplate {
  id?: number;
  name: string;
  start_location: string;
  end_location: string;
  intermediate_stops: string[];
  time?: string;
  available_seats: number;
  price_per_seat: number;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: number;
  trip?: number;
  trip_info?: {
    id: number;
    start_location: string;
    end_location: string;
    date: string;
    time: string;
    price_per_seat: string;
    available_seats: number;
  };
  notification_type: string;
  message: string;
  read: boolean;
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
  async createTrip(tripData: TripFormData): Promise<Trip> {
    console.log('Sending trip data to API:', tripData); // Debug
    try {
      const response = await api.post('/trips/', tripData);
      console.log('Trip created successfully, response:', response.data); // Debug
      return response.data;
    } catch (error: any) {
      console.error('Error in createTrip:', error); // Debug
      console.error('Error response data:', error.response?.data); // Debug
      throw error;
    }
  },

  async getTrips() {
    const response = await api.get('/trips/');
    return response.data;
  },

  async getTrip(tripId: number | string) {
    const response = await api.get(`/trips/${tripId}/`);
    return response.data;
  },

  async getMyTrips() {
    try {
      console.log('Fetching my trips...'); // Debug
      const response = await api.get('/trips/my_trips/');
      console.log('My trips response:', response.data); // Debug
      return response.data;
    } catch (error: any) {
      console.error('Error in getMyTrips:', error); // Debug
      console.error('Error response:', error.response); // Debug
      throw error;
    }
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

  async acceptBooking(tripId: number, bookingId: number) {
    const response = await api.post(`/trips/${tripId}/accept_booking/`, { booking_id: bookingId });
    return response.data as Booking;
  },

  async rejectBooking(tripId: number, bookingId: number) {
    const response = await api.post(`/trips/${tripId}/reject_booking/`, { booking_id: bookingId });
    return response.data as Booking;
  },

  async cancelBooking(tripId: number, bookingId: number) {
    const response = await api.post(`/trips/${tripId}/cancel_booking/`, { booking_id: bookingId });
    return response.data as Booking;
  },

  async payBooking(tripId: number, bookingId: number) {
    const response = await api.post(`/trips/${tripId}/pay_booking/`, { booking_id: bookingId });
    return response.data as Booking;
  },

  async completeTrip(tripId: number) {
    const response = await api.post(`/trips/${tripId}/complete_trip/`);
    return response.data;
  },

  async createBooking(tripId: number, seats: number = 1) {
    const response = await api.post(`/trips/${tripId}/create_booking/`, { seats });
    return response.data as Booking;
  },
};

// Booking Service
export const bookingService = {
  async getMyBookings(status?: string) {
    const params = status ? `?status=${status}` : '';
    // Używamy końcowego slasha zgodnie z Django REST framework
    const url = `/bookings/my/${params}`;
    const response = await api.get(url);
    return response.data as Booking[];
  },
};

// Wallet Service
export interface Wallet {
  id: number;
  user: number;
  username: string;
  balance: string;
  pending_amount?: string;
  pending_trips?: Array<{
    trip_id: number;
    route: string;
    date: string;
    amount: string;
    bookings_count: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user: number;
  username: string;
  transaction_type: 'deposit' | 'payment' | 'withdrawal' | 'refund' | 'driver_payment';
  transaction_type_display: string;
  amount: string;
  booking?: number | null;
  booking_info?: {
    id: number;
    seats: number;
    status: string;
  } | null;
  trip?: number | null;
  trip_info?: {
    id: number;
    start_location: string;
    end_location: string;
    date: string;
  } | null;
  description: string;
  created_at: string;
}

export const walletService = {
  async getWallet(): Promise<Wallet> {
    const response = await api.get('/wallet/');
    return response.data;
  },

  async deposit(amount: number): Promise<Wallet> {
    const response = await api.post('/wallet/', { amount });
    return response.data;
  },

  async getTransactions(type?: string): Promise<Transaction[]> {
    const params = type ? `?type=${type}` : '';
    const response = await api.get(`/transactions/${params}`);
    return response.data;
  },
};

export const favoriteRouteService = {
  async getFavoriteRoutes(): Promise<FavoriteRoute[]> {
    const response = await api.get('/favorite-routes/');
    return response.data;
  },

  async createFavoriteRoute(route: { start_location: string; end_location: string }): Promise<FavoriteRoute> {
    const response = await api.post('/favorite-routes/', route);
    return response.data;
  },

  async deleteFavoriteRoute(routeId: number): Promise<void> {
    await api.delete(`/favorite-routes/${routeId}/`);
  },
};

export const tripTemplateService = {
  async getTemplates(): Promise<TripTemplate[]> {
    const response = await api.get('/trip-templates/');
    return response.data;
  },

  async createTemplate(template: Omit<TripTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<TripTemplate> {
    const response = await api.post('/trip-templates/', template);
    return response.data;
  },

  async updateTemplate(templateId: number, template: Partial<TripTemplate>): Promise<TripTemplate> {
    const response = await api.patch(`/trip-templates/${templateId}/`, template);
    return response.data;
  },

  async deleteTemplate(templateId: number): Promise<void> {
    await api.delete(`/trip-templates/${templateId}/`);
  },

  async createTripFromTemplate(templateId: number, date: string): Promise<Trip> {
    const response = await api.post(`/trip-templates/${templateId}/create_trip/`, { date });
    return response.data;
  },
};

export const notificationService = {
  async getNotifications(read?: boolean): Promise<Notification[]> {
    const params = read !== undefined ? `?read=${read}` : '';
    const response = await api.get(`/notifications/${params}`);
    return response.data;
  },

  async markAsRead(notificationId: number): Promise<void> {
    await api.post(`/notifications/${notificationId}/mark_as_read/`);
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/mark_all_as_read/');
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread_count/');
    return response.data.count;
  },
};