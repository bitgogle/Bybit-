import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  getMe: () => api.get('/auth/me'),
};

// User APIs
export const userAPI = {
  getDashboard: () => api.get('/users/dashboard'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Investment APIs
export const investmentAPI = {
  getPlans: () => api.get('/investment-plans'),
  createInvestment: (data) => api.post('/investments', data),
  getInvestments: () => api.get('/investments'),
};

// Transaction APIs
export const transactionAPI = {
  createDeposit: (data) => api.post('/deposits', data),
  createWithdrawal: (data) => api.post('/withdrawals', data),
  getTransactions: () => api.get('/transactions'),
};

// Referral APIs
export const referralAPI = {
  getReferrals: () => api.get('/referrals'),
};

// Settings APIs
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (status) => api.get('/admin/users', { params: { status } }),
  approveUser: (userId) => api.put(`/admin/users/${userId}/approve`),
  rejectUser: (userId) => api.put(`/admin/users/${userId}/reject`),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  adjustBalance: (userId, data) => api.post(`/admin/users/${userId}/balance`, data),
  getTransactions: (type, status) => api.get('/admin/transactions', { params: { type, status } }),
  approveTransaction: (txnId) => api.put(`/admin/transactions/${txnId}/approve`),
  rejectTransaction: (txnId, reason) => api.put(`/admin/transactions/${txnId}/reject`, null, { params: { reason } }),
  updateWithdrawalStatus: (txnId, status) => api.put(`/admin/transactions/${txnId}/status`, null, { params: { status } }),
  updateSettings: (data) => api.put('/admin/settings', data),
  getInvestments: () => api.get('/admin/investments'),
};

export default api;