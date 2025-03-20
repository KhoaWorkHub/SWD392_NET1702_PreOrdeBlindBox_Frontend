import { useState, useCallback } from 'react';
import campaignService from '../api/services/campaignService';
import { message } from 'antd';

/**
 * Custom hook for managing campaigns
 * @returns {Object} Campaign management methods and state
 */
const useCampaignManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  /**
   * Create a new campaign
   * 
   * @param {Object} campaignData - Campaign data to create
   * @returns {Promise<boolean>} - Success status
   */
  const createCampaign = useCallback(async (campaignData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure blindboxSeriesId is a number
      if (typeof campaignData.blindboxSeriesId === 'string') {
        campaignData.blindboxSeriesId = parseInt(campaignData.blindboxSeriesId, 10);
      }
      
      const response = await campaignService.createCampaign(campaignData);
      
      if (response && response.status === true) {
        message.success('Campaign created successfully');
        return true;
      } else {
        throw new Error(response?.message || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setError(error.message || 'Failed to create campaign');
      message.error(error.message || 'Failed to create campaign');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get all campaigns for a blindbox series
   * 
   * @param {number} seriesId - Blindbox series ID
   * @returns {Promise<boolean>} - Success status
   */
  const getSeriesCampaigns = useCallback(async (seriesId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure seriesId is a number
      if (typeof seriesId === 'string') {
        seriesId = parseInt(seriesId, 10);
      }
      
      const response = await campaignService.getSeriesCampaigns(seriesId);
      
      if (response && response.status === true && response.metadata) {
        setCampaigns(response.metadata);
        return true;
      } else {
        throw new Error(response?.message || 'Failed to fetch campaigns');
      }
    } catch (error) {
      console.error(`Error fetching campaigns for series ${seriesId}:`, error);
      setError(error.message || 'Failed to fetch campaigns');
      message.error(error.message || 'Failed to fetch campaigns');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get campaign details
   * 
   * @param {number} campaignId - Campaign ID
   * @returns {Promise<Object|null>} - Campaign details or null
   */
  const getCampaignDetails = useCallback(async (campaignId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure campaignId is a number
      if (typeof campaignId === 'string') {
        campaignId = parseInt(campaignId, 10);
      }
      
      const response = await campaignService.getCampaignDetails(campaignId);
      
      if (response && response.status === true && response.metadata) {
        setSelectedCampaign(response.metadata);
        return response.metadata;
      } else {
        throw new Error(response?.message || 'Failed to fetch campaign details');
      }
    } catch (error) {
      console.error(`Error fetching campaign ${campaignId}:`, error);
      setError(error.message || 'Failed to fetch campaign details');
      message.error(error.message || 'Failed to fetch campaign details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * End a campaign
   * 
   * @param {number} campaignId - Campaign ID
   * @returns {Promise<boolean>} - Success status
   */
  const endCampaign = useCallback(async (campaignId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure campaignId is a number
      if (typeof campaignId === 'string') {
        campaignId = parseInt(campaignId, 10);
      }
      
      const response = await campaignService.endCampaign(campaignId);
      
      if (response && response.status === true) {
        message.success('Campaign ended successfully');
        
        // Update local state
        setCampaigns(prev => 
          prev.map(campaign => 
            campaign.id === campaignId 
              ? { ...campaign, active: false } 
              : campaign
          )
        );
        
        if (selectedCampaign && selectedCampaign.id === campaignId) {
          setSelectedCampaign(prev => ({ ...prev, active: false }));
        }
        
        return true;
      } else {
        throw new Error(response?.message || 'Failed to end campaign');
      }
    } catch (error) {
      console.error(`Error ending campaign ${campaignId}:`, error);
      setError(error.message || 'Failed to end campaign');
      message.error(error.message || 'Failed to end campaign');
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedCampaign]);

  return {
    loading,
    error,
    campaigns,
    selectedCampaign,
    createCampaign,
    getSeriesCampaigns,
    getCampaignDetails,
    endCampaign,
    setSelectedCampaign
  };
};

export default useCampaignManagement;