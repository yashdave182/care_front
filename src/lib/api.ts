import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const hospitalApi = {
  setup: async (data: {
    hospital_name: string;
    location: string;
    contact: string;
    floors: number;
    beds_count: number;
    nurses_count: number;
    doctors_count: number;
    icu_beds_count: number;
  }) => {
    const response = await api.post('/hospital/setup', data);
    return response.data;
  },
  
  getStatus: async () => {
    const response = await api.get('/hospital/status');
    return response.data;
  },
};

export const emergencyApi = {
  trigger: async (data: {
    type: string;
    patient_name: string;
    caller_phone: string;
  }) => {
    const response = await api.post('/emergency/trigger', data);
    return response.data;
  },
  
  getActive: async () => {
    const response = await api.get('/emergency/active');
    return response.data;
  },
  
  resolve: async (id: string) => {
    const response = await api.post(`/emergency/${id}/resolve`);
    return response.data;
  },
};

export const resourceApi = {
  getBeds: async () => {
    const response = await api.get('/resources/beds');
    return response.data;
  },
  
  getNurses: async () => {
    const response = await api.get('/resources/nurses');
    return response.data;
  },
  
  getDoctors: async () => {
    const response = await api.get('/resources/doctors');
    return response.data;
  },
};

export default api;
