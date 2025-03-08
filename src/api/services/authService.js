import axiosInstance from '../../api/axios';
import endpoints from '../../api/endpoint';

const authService = {
  /**
   * Login user with email and password
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise} - Promise with response data
   */
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.login, credentials);
      
      localStorage.setItem('accessToken', response.data.metadata.accessToken);
      localStorage.setItem('user', response.data.metadata.roles);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || { 
        //message: 'An error occurred during login. Please try again.'
      };
    }
  },
  
  /**
   * Logout user by removing tokens and user data
   */
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    // Optional: Call logout endpoint to invalidate token on server
    // return axiosInstance.post(endpoints.auth.logout);
  },
  
  /**
   * Get current authenticated user
   * @returns {Object|null} User data or null if not authenticated
   */
  getCurrentUser: () => {
    const userRoles = localStorage.getItem('user');
    if (!userRoles) return null;
    
    return userRoles;
  },
  
  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated, false otherwise
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  }
};

export default authService;