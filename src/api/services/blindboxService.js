import axiosInstance from '../axios';

/**
 * Service for handling BlindBox related API calls
 * 
 * Note: The backend API path is '/api/${api.version}/blindbox'
 * The actual property names from the backend are:
 * - id: The blindbox series ID
 * - seriesName: Name of the blindbox series
 * - boxPrice: Price of a single blind box
 * - packagePrice: Price of a package of blind boxes
 * - description: Description of the blind box series
 * - createdAt: Creation date
 * - updatedAt: Last update date
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
      
      const response = await axiosInstance.get(`/blindbox?${queryParams.toString()}`);
      console.log('API Response:', response.data); // Debug
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
      const response = await axiosInstance.get(`/blindbox/${id}`);
      console.log(`Detailed response for ID ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching blind box series with ID ${id}:`, error);
      throw error.response?.data || {
        message: 'An error occurred while fetching blind box series details'
      };
    }
  }
};

export default blindboxService;