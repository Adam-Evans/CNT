import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (username, password) => api.post('/auth/register', { username, password }),
  getCurrentUser: () => api.get('/auth/me'),
};

// Broker API
export const brokerAPI = {
  getAllBrokers: () => api.get('/brokers'),
  getBrokerProfile: (id) => api.get(`/brokers/${id}`),
  getMyProfile: () => api.get('/my/profile'),
  updateMyProfile: (data) => api.put('/my/profile', data),
  getMyPropaganda: () => api.get('/my/propaganda'),
};

// Order API
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/my/orders'),
};

// Admin API
export const adminAPI = {
  getAllOrders: () => api.get('/admin/orders'),
  updateOrder: (id, data) => api.put(`/admin/orders/${id}`, data),
  getBrokerStats: () => api.get('/admin/stats'),
  updateConfig: (data) => api.put('/admin/config', data),
  updateBrokerProfile: (id, data) => api.put(`/admin/brokers/${id}`, data),
};

// Config API
export const configAPI = {
  getConfig: () => api.get('/config'),
};

export default api;
