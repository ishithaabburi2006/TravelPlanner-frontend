import axios from 'axios';

const api = axios.create({
  baseURL: window.__TRAVEL_PLANNER_API_URL__ || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
