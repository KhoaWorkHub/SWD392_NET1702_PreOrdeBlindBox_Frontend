import axiosInstance from '../axios';
import endpoints from '../endpoint';

/**
 * Service for handling Campaign related API calls
 */
const campaignService = {
  /**
   * Create a new campaign
   * 
   * @param {Object} campaignData - Campaign creation data
   * @returns {Promise} - Promise with response data
   */
  createCampaign: async (campaignData) => {
    try {
      const response = await axiosInstance.post(endpoints.campaign.create, campaignData);
      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error.response?.data || {
        message: 'An error occurred while creating the campaign'
      };
    }
  },

  /**
   * Get all campaigns for a blindbox series
   * 
   * @param {number} seriesId - Blindbox series ID
   * @returns {Promise} - Promise with response data
   */
  getSeriesCampaigns: async (seriesId) => {
    try {
      // Ensure seriesId is a number
      const id = parseInt(seriesId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid series ID');
      }
      
      const response = await axiosInstance.get(endpoints.campaign.getSeriesCampaigns(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaigns for series ${seriesId}:`, error);
      throw error.response?.data || {
        message: 'An error occurred while fetching campaigns'
      };
    }
  },

  /**
   * Get campaign details by ID
   * 
   * @param {number} campaignId - Campaign ID
   * @returns {Promise} - Promise with response data
   */
  getCampaignDetails: async (campaignId) => {
    try {
      // Ensure campaignId is a number
      const id = parseInt(campaignId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid campaign ID');
      }
      
      const response = await axiosInstance.get(endpoints.campaign.getCampaignDetails(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaign details ${campaignId}:`, error);
      throw error.response?.data || {
        message: 'An error occurred while fetching campaign details'
      };
    }
  },

  /**
   * End a campaign
   * 
   * @param {number} campaignId - Campaign ID
   * @returns {Promise} - Promise with response data
   */
  endCampaign: async (campaignId) => {
    try {
      // Ensure campaignId is a number
      const id = parseInt(campaignId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid campaign ID');
      }
      
      const response = await axiosInstance.put(endpoints.campaign.endCampaign(id));
      return response.data;
    } catch (error) {
      console.error(`Error ending campaign ${campaignId}:`, error);
      throw error.response?.data || {
        message: 'An error occurred while ending the campaign'
      };
    }
  }
};

export default campaignService;