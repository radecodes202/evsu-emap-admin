import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Buildings API
export const buildingsAPI = {
  getAll: () => api.get('/buildings'),
  getById: (id) => api.get(`/buildings/${id}`),
  create: (data) => api.post('/buildings', data),
  update: (id, data) => api.put(`/buildings/${id}`, data),
  delete: (id) => api.delete(`/buildings/${id}`),
};

// Users API (assuming these endpoints exist)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  resetPassword: (id, newPassword) => api.post(`/users/${id}/reset-password`, { password: newPassword }),
};

// Settings API (assuming these endpoints exist)
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

// Chatbot API (assuming these endpoints exist)
export const chatbotAPI = {
  getResponses: () => api.get('/chatbot/responses'),
  updateResponses: (data) => api.put('/chatbot/responses', data),
  getSuggestedQuestions: () => api.get('/chatbot/suggested-questions'),
  updateSuggestedQuestions: (data) => api.put('/chatbot/suggested-questions', data),
};

// Paths/Walkways API
export const pathsAPI = {
  getAll: () => api.get('/paths'),
  getById: (id) => api.get(`/paths/${id}`),
  create: (data) => api.post('/paths', data),
  update: (id, data) => api.put(`/paths/${id}`, data),
  delete: (id) => api.delete(`/paths/${id}`),
  addWaypoint: (pathId, data) => api.post(`/paths/${pathId}/waypoints`, data),
  updateWaypoint: (waypointId, data) => api.put(`/waypoints/${waypointId}`, data),
  deleteWaypoint: (waypointId) => api.delete(`/waypoints/${waypointId}`),
};

export default api;

