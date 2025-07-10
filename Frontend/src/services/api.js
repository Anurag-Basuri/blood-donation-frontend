import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';
import { showError } from '../utils/toast'; // Optional

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.warn('⚠️ Warning: VITE_API_URL not defined. Falling back to http://localhost:8000');
}

const BASE_URL = API_BASE_URL || 'http://localhost:8000';

// ✅ Authenticated Client
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// ✅ Public Client (no token)
const publicClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// ✅ Request Interceptor: Add Token
axiosInstance.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// ✅ Response Interceptor: Global Error Handling
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response;

      // Global toast (optional)
      showError(data?.message || 'An unexpected error occurred.');

      if (status === 401) {
        removeToken();
        window.location.href = '/login'; // Or use router redirect
      }
    }
    return Promise.reject(error);
  },
);

export { axiosInstance, publicClient };
