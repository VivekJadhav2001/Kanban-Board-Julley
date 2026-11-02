import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api/v1';

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: unknown[];
}

class BackendError extends Error implements ApiError {
  statusCode: number;
  errors?: unknown[];

  constructor(message: string, statusCode: number, errors?: unknown[]) {
    super(message);
    this.name = 'BackendError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const { response } = error;

    if (response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(new BackendError('Session expired. Please login again.', 401));
    }

    const message = response?.data?.message || error.message || 'An unexpected error occurred.';
    const statusCode = response?.status || 500;
    const errors = response?.data?.errors;

    return Promise.reject(new BackendError(message, statusCode, errors));
  }
);

export { axiosInstance, BackendError };
