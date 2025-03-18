import axiosInstance from '../axios';
// Import the endpoints from the endpoint module
import endpoints from '../endpoint';

/**
 * Service for handling User related API calls
 */
const userService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.name - User full name
   * @param {string} userData.phone - User phone number (10 digits)
   * @param {string} userData.password - User password
   * @param {string} [userData.gender] - User gender (MALE, FEMALE, OTHER)
   * @param {string} [userData.dateOfBirth] - User date of birth (YYYY-MM-DD)
   * @returns {Promise} - Promise with response data
   */
  register: async (userData) => {
    try {
      // Use the correct signup endpoint
      const endpoint = '/users/signup';
      
      // Prepare registration payload that matches the backend expectations
      const registrationData = {
        email: userData.email?.trim(),
        name: userData.name?.trim(),
        phone: userData.phone?.trim(),
        password: userData.password?.trim(),
        gender: userData.gender || null,
        dateOfBirth: userData.dateOfBirth 
          ? userData.dateOfBirth.format ? userData.dateOfBirth.format('YYYY-MM-DD') : userData.dateOfBirth
          : null
      };

      console.log('Sending registration data:', registrationData);
      
      const response = await axiosInstance.post(endpoint, registrationData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error.response?.data || { 
        message: 'An error occurred during registration. Please try again.' 
      };
    }
  },


  /**
   * Initiate forgot password process
   * 
   * @param {Object} request - Forgot password request
   * @param {string} request.email - User email
   * @returns {Promise} - Promise with response data
   */
  forgotPassword: async (request) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.forgotPassword, request);
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error.response?.data || { 
        message: 'An error occurred while processing your request. Please try again.' 
      };
    }
  },

  /**
   * Resend OTP code
   * 
   * @param {Object} request - Resend OTP request
   * @param {string} request.email - User email
   * @returns {Promise} - Promise with response data
   */
  resendOTP: async (request) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.resendOTP, request);
      return response.data;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error.response?.data || { 
        message: 'An error occurred while sending the OTP. Please try again.' 
      };
    }
  },

  /**
   * Confirm OTP code
   * 
   * @param {Object} request - Confirm OTP request
   * @param {string} request.email - User email
   * @param {string} request.otpCode - OTP code received
   * @param {string} request.newPassword - New password to set
   * @returns {Promise} - Promise with response data
   */
  confirmOTP: async (request) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.confirmOTP, request);
      return response.data;
    } catch (error) {
      console.error('Confirm OTP error:', error);
      throw error.response?.data || { 
        message: 'Invalid or expired OTP code. Please try again.' 
      };
    }
  },

  /**
   * Get all users with filtering (admin/staff only)
   * 
   * @param {Object} criteria - Filter criteria for users
   * @returns {Promise} - Promise with paginated user data
   */
  getAllUsers: async (criteria) => {
    try {
      const response = await axiosInstance.get(endpoints.user.getAll, { data: criteria });
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error.response?.data || { 
        message: 'An error occurred while fetching users.' 
      };
    }
  },

  /**
   * Set user as staff (admin only)
   * 
   * @param {number} userId - ID of user to promote to staff
   * @returns {Promise} - Promise with response data
   */
  setUserAsStaff: async (userId) => {
    try {
      const response = await axiosInstance.put(endpoints.user.setStaff(userId));
      return response.data;
    } catch (error) {
      console.error('Set staff error:', error);
      throw error.response?.data || { 
        message: 'An error occurred while updating user role.' 
      };
    }
  },

  /**
   * Update user active status (admin only)
   * 
   * @param {number} userId - ID of user to update
   * @param {boolean} isActive - Whether to activate or deactivate the user
   * @returns {Promise} - Promise with response data
   */
  updateUserActiveStatus: async (userId, isActive) => {
    try {
      const response = await axiosInstance.put(
        endpoints.user.updateActiveStatus(userId),
        null,
        { params: { isActive } }
      );
      return response.data;
    } catch (error) {
      console.error('Update user status error:', error);
      throw error.response?.data || { 
        message: 'An error occurred while updating user status.' 
      };
    }
  },

  /**
   * Get user profile information
   * 
   * @returns {Promise} - Promise with user profile data
   */
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get(endpoints.user.profile);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error.response?.data || { 
        message: 'An error occurred while fetching user profile.' 
      };
    }
  },

  /**
   * Update user profile information
   * 
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} - Promise with response data
   */
  updateUserProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put(endpoints.user.updateProfile, profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response?.data || { 
        message: 'An error occurred while updating your profile.' 
      };
    }
  }
};

export default userService;