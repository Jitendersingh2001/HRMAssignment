import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const isAuth = localStorage.getItem('hrms_auth');
  if (isAuth === 'true') {
    config.headers.Authorization = `Bearer admin123-token`;
  }
  return config;
});

export default api;
