import axios, { AxiosError } from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const cleanBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export const apiClient = axios.create({
  // Empty uses Vite's local proxy; set VITE_API_BASE_URL for a separately hosted API.
  baseURL: cleanBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Authentication Expiration & Error Formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string | Array<{ msg: string }> }>) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if we are on the login page
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('tot_token');
        localStorage.removeItem('tot_user');
        window.dispatchEvent(new Event('tot-auth-expired'));
      }
    }

    let errorMessage = 'An unexpected error occurred';
    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === 'string') {
        errorMessage = error.response.data.detail;
      } else if (Array.isArray(error.response.data.detail)) {
        errorMessage = error.response.data.detail.map((d) => d.msg).join(', ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);
