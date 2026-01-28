import { api } from './api';

// Recurring Trip interfaces
export interface RecurringTrip {
  id: number;
  driver: number;
  driver_username: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  weekdays: number[];
  start_location: string;
  end_location: string;
  intermediate_stops: string[];
  time: string;
  available_seats: number;
  price_per_seat: string;
  start_date: string;
  end_date?: string;
  active: boolean;
  last_generated?: string;
  created_at: string;
}

export interface CreateRecurringTripData {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  weekdays?: number[];
  start_location: string;
  end_location: string;
  intermediate_stops?: string[];
  time: string;
  available_seats: number;
  price_per_seat: number | string;
  start_date: string;
  end_date?: string;
}

export const recurringTripService = {
  async getRecurringTrips(): Promise<RecurringTrip[]> {
    const response = await api.get('/recurring-trips/');
    return response.data;
  },

  async createRecurringTrip(data: CreateRecurringTripData): Promise<RecurringTrip> {
    const response = await api.post('/recurring-trips/', data);
    return response.data;
  },

  async updateRecurringTrip(tripId: number, data: Partial<CreateRecurringTripData>): Promise<RecurringTrip> {
    const response = await api.patch(`/recurring-trips/${tripId}/`, data);
    return response.data;
  },

  async deleteRecurringTrip(tripId: number): Promise<void> {
    await api.delete(`/recurring-trips/${tripId}/`);
  },

  async toggleActive(tripId: number): Promise<{ active: boolean }> {
    const response = await api.post(`/recurring-trips/${tripId}/toggle_active/`);
    return response.data;
  },

  async generateTrips(tripId: number, days: number = 30): Promise<{ generated: number; trip_ids: number[] }> {
    const response = await api.post(`/recurring-trips/${tripId}/generate_trips/`, { days });
    return response.data;
  },
};
