import axiosInstance from '../axios';
import endpoints from '../endpoint';

/**
 * Service for handling BlindBox related API calls for both public and admin operations
 */
const blindboxService = {
  /**
   * Get all blind box series with optional filtering, paging and sorting
   * 
   * @param {Object} params - Query parameters
   * @param {string} [params.seriesName] - Optional series name for filtering
   * @param {number} [params.page=0] - Page number (zero-based)
   * @param {number} [params.size=10] - Page size
   * @param {string} [params.sort='id,asc'] - Sort parameter (field,direction)
   * @returns {Promise} - Promise with response data
   */
  getAllBlindBoxSeries: async (params = {}) => {
    try {
      const { seriesName, page = 0, size = 10, sort = 'id,asc' } = params;
      
      const queryParams = new URLSearchParams();
      
      // Add optional parameters only if they exist
      if (seriesName) queryParams.append('seriesName', seriesName);
      queryParams.append('page', page);
      queryParams.append('size', size);
      
      // Handle sort parameter (might be array or string)
      if (Array.isArray(sort)) {
        sort.forEach(sortItem => queryParams.append('sort', sortItem));
      } else {
        queryParams.append('sort', sort);
      }
      
      const response = await axiosInstance.get(`${endpoints.blindbox.getAllSeries}?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blind box series:', error);
      throw error.response?.data || {
        message: 'An error occurred while fetching blind box series'
      };
    }
  },
  
  /**
   * Get blind box series details by ID
   * 
   * @param {number} id - Blind box series ID
   * @returns {Promise} - Promise with response data
   */
  getBlindBoxSeriesById: async (id) => {
    try {
      const response = await axiosInstance.get(endpoints.blindbox.getSeriesById(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching blind box series with ID ${id}:`, error);
      throw error.response?.data || {
        message: 'An error occurred while fetching blind box series details'
      };
    }
  },

  /**
   * Create a new blind box series with images (staff/admin only)
   * 
   * @param {FormData} formData - FormData containing both request data and images
   * @returns {Promise} - Promise with response data
   */
  createBlindBoxSeries: async (formData) => {
    try {
      // Add additional logging to debug the raw response
      const response = await axiosInstance.post(
        endpoints.blindbox.createSeries,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Log the actual response before returning
      console.log("API Response:", {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating blind box series:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('Server response error:', {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Request error:', error.message);
      }
      
      throw error.response?.data || {
        message: 'An error occurred while creating blind box series'
      };
    }
  },

  /**
   * Upload images for a blindbox item
   * 
   * @param {number} itemId - Blindbox item ID
   * @param {Array<File>} files - Image files to upload
   * @returns {Promise} - Promise with response data
   */
  uploadBlindboxItemImages: async (itemId, files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axiosInstance.put(
        endpoints.blindbox.uploadItemImages(itemId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error uploading images for blindbox item ${itemId}:`, error);
      throw error.response?.data || {
        message: 'An error occurred while uploading images'
      };
    }
  },

  /**
   * Update an existing blind box series (staff/admin only)
   * 
   * @param {number} id - Blind box series ID
   * @param {Object} blindboxData - Updated blind box series data
   * @returns {Promise} - Promise with response data
   */
  updateBlindBoxSeries: async (id, blindboxData) => {
    try {
      const response = await axiosInstance.put(
        endpoints.blindbox.updateSeries(id), 
        blindboxData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating blind box series with ID ${id}:`, error);
      throw error.response?.data || {
        message: 'An error occurred while updating blind box series'
      };
    }
  },

  /**
   * Delete a blind box series (admin only)
   * 
   * @param {number} id - Blind box series ID
   * @returns {Promise} - Promise with response data
   */
  deleteBlindBoxSeries: async (id) => {
    try {
      const response = await axiosInstance.delete(endpoints.blindbox.deleteSeries(id));
      return response.data;
    } catch (error) {
      console.error(`Error deleting blind box series with ID ${id}:`, error);
      throw error.response?.data || {
        message: 'An error occurred while deleting blind box series'
      };
    }
  }
};

export default blindboxService;