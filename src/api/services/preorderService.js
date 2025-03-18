import axiosInstance from '../axios';
import endpoints from '../endpoint';

/**
 * Service for handling Preorder related API calls
 */
const preorderService = {
  /**
   * Get the preorder history for the current authenticated user
   * 
   * @returns {Promise} - Promise with response data containing preorder history
   */
  getPreorderHistory: async () => {
    try {
      const response = await axiosInstance.get('/preorders');
      return response.data;
    } catch (error) {
      console.error('Error fetching preorder history:', error);
      throw error.response?.data || {
        message: 'An error occurred while fetching your preorder history'
      };
    }
  },

  /**
   * Get detailed information for a specific preorder
   * 
   * @param {number} id - ID of the preorder to retrieve details for
   * @returns {Promise} - Promise with response data containing preorder details
   */
  getPreorderDetails: async (id) => {
    try {
      const response = await axiosInstance.get(`/preorders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching preorder details for ID ${id}:`, error);
      throw error.response?.data || {
        message: 'An error occurred while fetching the preorder details'
      };
    }
  }
};

export default preorderService;