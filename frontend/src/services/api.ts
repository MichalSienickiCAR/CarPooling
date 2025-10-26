import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
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