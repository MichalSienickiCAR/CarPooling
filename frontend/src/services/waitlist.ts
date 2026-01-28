import { api, TripInfo } from './api';

// Waitlist interfaces
export interface WaitlistEntry {
  id: number;
  trip: number;
  trip_info: TripInfo;
  passenger: number;
  passenger_username: string;
  seats_requested: number;
  notified: boolean;
  created_at: string;
}

export interface JoinWaitlistData {
  trip: number;
  seats_requested: number;
}

export const waitlistService = {
  async getMyWaitlist(): Promise<WaitlistEntry[]> {
    const response = await api.get('/waitlist/');
    return response.data;
  },

  async joinWaitlist(data: JoinWaitlistData): Promise<WaitlistEntry> {
    const response = await api.post('/waitlist/', data);
    return response.data;
  },

  async leaveWaitlist(waitlistId: number): Promise<void> {
    await api.delete(`/waitlist/${waitlistId}/`);
  },

  async getWaitlistForTrip(tripId: number): Promise<WaitlistEntry[]> {
    const response = await api.get('/waitlist/for_trip/', { params: { trip_id: tripId } });
    return response.data;
  },
};
