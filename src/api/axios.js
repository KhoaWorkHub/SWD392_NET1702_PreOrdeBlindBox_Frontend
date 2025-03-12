import axios from 'axios';

// Using environment variable for API URL or fallback to default
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 Unauthorized, redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      window.location.href = '/login';
    }
    
    // For 403 Forbidden errors - possibly due to token issues
    if (error.response?.status === 403) {
      console.error('Access forbidden. Check your permissions or login status.');
    }

    // For 404 Not Found errors - possibly wrong API endpoint
    if (error.response?.status === 404) {
      console.error('Resource not found. Check the API endpoint path.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;