
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import { ApiError } from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5050/api/v1";

// Backend error response type
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: unknown[];
}

// Custom backend error class
class BackendError extends Error implements ApiError {
  statusCode: number;
  errors?: unknown[];

  constructor(
    message: string,
    statusCode: number,
    errors?: unknown[]
  ) {
    super(message);

    this.name = "BackendError";
    this.statusCode = statusCode;
    this.errors = errors;

    Object.setPrototypeOf(this, BackendError.prototype);
  }
}

// Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // No token handling required.
    // Browser automatically sends HTTP-only cookies.

    return config;
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,

  (error: AxiosError<ApiErrorResponse>) => {
    const response = error.response;

    // Handle unauthorized requests
    if (response?.status === 401) {
      const currentPath =
        typeof window !== "undefined"
          ? window.location.pathname
          : "";

      // Avoid redirecting for login/register requests
      const requestURL = error.config?.url || "";

      const isAuthRequest =
        requestURL.includes("/auth/login") ||
        requestURL.includes("/auth/register");

      if (
        typeof window !== "undefined" &&
        currentPath !== "/login" &&
        !isAuthRequest
      ) {
        window.location.href = "/login";
      }

      return Promise.reject(
        new BackendError(
          response.data?.message ||
            "Session expired. Please login again.",
          401,
          response.data?.errors
        )
      );
    }

    // Other backend errors
    const message =
      response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";

    const statusCode = response?.status || 500;

    const errors = response?.data?.errors;

    return Promise.reject(
      new BackendError(message, statusCode, errors)
    );
  }
);

export { axiosInstance, BackendError };
