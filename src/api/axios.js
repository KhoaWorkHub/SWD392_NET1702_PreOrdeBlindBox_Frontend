// This code should be added to your src/api/axios.js file
// to allow GET requests with a request body

// Modify your axios instance to support GET requests with a body
import axios from 'axios';

// Using environment variable for API URL or fallback to default
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Important for CORS with credentials
});

// Special configuration to send body with GET requests
// This overrides the standard axios behavior
const originalGet = axiosInstance.get;
axiosInstance.get = function(url, config = {}) {
  // Extract the data from config
  const { data, ...otherConfig } = config;
  
  // If there's data, convert the GET to a POST with a custom method header
  if (data) {
    return axios({
      ...otherConfig,
      method: 'post', // Using POST because browsers properly send bodies with POST
      url: baseURL + url,
      headers: {
        ...otherConfig.headers,
        'X-HTTP-Method-Override': 'GET', // Tell the server this is actually a GET
        'Content-Type': 'application/json',
      },
      data: data,
      withCredentials: true,
    });
  }
  
  // Otherwise, use the original get method
  return originalGet(url, otherConfig);
};

// Rest of your axios interceptors
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
    
    // Check if it's a CORS error
    if (error.message === 'Network Error' && error.response === undefined) {
      console.error('Possible CORS error:', error);
      return Promise.reject({ 
        message: 'Unable to connect to the server. Please check your network connection or try again later.' 
      });
    }
    
    // If 401 Unauthorized, redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
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
    
    return Promise.reject(error.response?.data || { 
      message: 'An unexpected error occurred. Please try again.' 
    });
  }
);

export default axiosInstance;