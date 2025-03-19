import { useState, useCallback } from 'react';
import blindboxService from '../api/services/blindboxService';
import { message } from 'antd';

/**
 * Custom hook for managing blindbox series in the dashboard
 * Handles all API calls and state management for admin/staff
 * 
 * @returns {Object} Blindbox management methods and state
 */
const useBlindboxManagement = () => {
  const [loading, setLoading] = useState(false);
  const [blindboxSeries, setBlindboxSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [error, setError] = useState(null);

  /**
   * Fetch all blindbox series with filtering, pagination, and sorting
   * 
   * @param {Object} options - Fetch options
   * @param {number} options.page - Page number (1-based for UI, 0-based for API)
   * @param {number} options.pageSize - Page size
   * @param {string} options.seriesName - Filter by series name
   * @param {string} options.sortField - Field to sort by
   * @param {string} options.sortDirection - Sort direction (asc/desc)
   * @returns {Promise<boolean>} - Success status
   */
  const fetchBlindboxSeries = useCallback(async ({
    page = pagination.current,
    pageSize = pagination.pageSize,
    seriesName = '',
    sortField = 'id',
    sortDirection = 'desc'
  } = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Format parameters for the API
      const params = {
        page: page - 1, // Convert from 1-based (UI) to 0-based (API)
        size: pageSize,
        seriesName: seriesName || undefined,
        sort: `${sortField},${sortDirection}`
      };
      
      const response = await blindboxService.getAllBlindBoxSeries(params);
      
      if (response && response.status === true && response.metadata) {
        const { content, totalElements, totalPages, number, size } = response.metadata;
        
        setBlindboxSeries(content || []);
        setPagination({
          current: (number || 0) + 1, // Convert from 0-based to 1-based for UI
          pageSize: size || pageSize,
          total: totalElements || 0,
          totalPages: totalPages || 0
        });
        
        return true;
      } else {
        throw new Error(response?.message || 'Failed to fetch blindbox series');
      }
    } catch (error) {
      console.error('Error fetching blindbox series:', error);
      setError(error.message || 'Failed to fetch blindbox series');
      message.error(error.message || 'Failed to fetch blindbox series');
      return false;
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  /**
   * Get a single blindbox series by ID
   * 
   * @param {number} id - Blindbox series ID
   * @returns {Promise<Object|null>} - Blindbox series data or null
   */
  const getBlindboxSeriesById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await blindboxService.getBlindBoxSeriesById(id);
      
      if (response && response.status === true && response.metadata) {
        setSelectedSeries(response.metadata);
        return response.metadata;
      } else {
        throw new Error(response?.message || 'Failed to fetch blindbox details');
      }
    } catch (error) {
      console.error(`Error fetching blindbox series with ID ${id}:`, error);
      setError(error.message || 'Failed to fetch blindbox details');
      message.error(error.message || 'Failed to fetch blindbox details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new blindbox series
   * 
   * @param {FormData} formData - FormData containing request data and images
   * @returns {Promise<boolean>} - Success status
   */
  const createBlindboxSeries = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Sending formData to API:", formData);
      
      const response = await blindboxService.createBlindBoxSeries(formData);
      
      // Log the complete response
      console.log("Complete API response:", response);
      
      // Specific check for your API response structure
      if (response && response.status === true && response.metadata) {
        console.log("Success! Created blindbox with ID:", response.metadata.id);
        message.success('Blindbox series created successfully');
        // Refresh the list
        await fetchBlindboxSeries();
        return true;
      } else {
        // Log what's missing in the success criteria
        console.error("Response validation failed:", {
          hasResponse: !!response,
          hasStatus: response && 'status' in response,
          statusValue: response?.status,
          hasMetadata: response && 'metadata' in response
        });
        
        throw new Error(response?.message || 'Failed to create blindbox series');
      }
    } catch (error) {
      console.error('Error creating blindbox series:', error);
      setError(error.message || 'Failed to create blindbox series');
      message.error(error.message || 'Failed to create blindbox series');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchBlindboxSeries]);

  /**
   * Update an existing blindbox series
   * 
   * @param {number} id - Blindbox series ID
   * @param {Object} data - Updated blindbox series data
   * @returns {Promise<boolean>} - Success status
   */
  const updateBlindboxSeries = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await blindboxService.updateBlindBoxSeries(id, data);
      
      if (response && response.status === true) {
        message.success('Blindbox series updated successfully');
        // Refresh the list and the selected series
        await fetchBlindboxSeries();
        if (selectedSeries && selectedSeries.id === id) {
          await getBlindboxSeriesById(id);
        }
        return true;
      } else {
        throw new Error(response?.message || 'Failed to update blindbox series');
      }
    } catch (error) {
      console.error(`Error updating blindbox series with ID ${id}:`, error);
      setError(error.message || 'Failed to update blindbox series');
      message.error(error.message || 'Failed to update blindbox series');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchBlindboxSeries, getBlindboxSeriesById, selectedSeries]);

  /**
   * Delete a blindbox series
   * 
   * @param {number} id - Blindbox series ID
   * @returns {Promise<boolean>} - Success status
   */
  const deleteBlindboxSeries = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await blindboxService.deleteBlindBoxSeries(id);
      
      if (response && response.status === true) {
        message.success('Blindbox series deleted successfully');
        // Refresh the list
        await fetchBlindboxSeries();
        // Clear selected series if it was deleted
        if (selectedSeries && selectedSeries.id === id) {
          setSelectedSeries(null);
        }
        return true;
      } else {
        throw new Error(response?.message || 'Failed to delete blindbox series');
      }
    } catch (error) {
      console.error(`Error deleting blindbox series with ID ${id}:`, error);
      setError(error.message || 'Failed to delete blindbox series');
      message.error(error.message || 'Failed to delete blindbox series');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchBlindboxSeries, selectedSeries]);

  /**
   * Upload images for a blindbox item
   * 
   * @param {number} itemId - Blindbox item ID
   * @param {Array<File>} files - Image files to upload
   * @returns {Promise<boolean>} - Success status
   */
  const uploadBlindboxItemImages = useCallback(async (itemId, files) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await blindboxService.uploadBlindboxItemImages(itemId, files);
      
      if (response && response.status === true) {
        message.success('Item images uploaded successfully');
        // Refresh the selected series if needed
        if (selectedSeries) {
          await getBlindboxSeriesById(selectedSeries.id);
        }
        return true;
      } else {
        throw new Error(response?.message || 'Failed to upload item images');
      }
    } catch (error) {
      console.error(`Error uploading images for blindbox item ${itemId}:`, error);
      setError(error.message || 'Failed to upload item images');
      message.error(error.message || 'Failed to upload item images');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getBlindboxSeriesById, selectedSeries]);

  return {
    blindboxSeries,
    selectedSeries,
    pagination,
    loading,
    error,
    fetchBlindboxSeries,
    getBlindboxSeriesById,
    createBlindboxSeries,
    updateBlindboxSeries,
    deleteBlindboxSeries,
    uploadBlindboxItemImages,
    setSelectedSeries
  };
};

export default useBlindboxManagement;