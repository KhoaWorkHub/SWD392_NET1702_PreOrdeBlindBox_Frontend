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
   * Upload an image for a blindbox item
   * 
   * @param {number} itemId - Blindbox item ID
   * @param {File} file - Image file to upload
   * @returns {Promise<boolean>} - Success status
   */
  const uploadBlindboxItemImage = useCallback(async (itemId, file) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await blindboxService.uploadBlindboxItemImage(itemId, file);
      
      if (response && response.status === true) {
        message.success('Item image uploaded successfully');
        // Refresh the selected series if needed
        if (selectedSeries) {
          await getBlindboxSeriesById(selectedSeries.id);
        }
        return true;
      } else {
        throw new Error(response?.message || 'Failed to upload item image');
      }
    } catch (error) {
      console.error(`Error uploading image for blindbox item ${itemId}:`, error);
      setError(error.message || 'Failed to upload item image');
      message.error(error.message || 'Failed to upload item image');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getBlindboxSeriesById, selectedSeries]);

  /**
   * Upload images for blindbox series
   * 
   * @param {number} seriesId - Blindbox series ID
   * @param {Array<File>} files - Image files to upload
   * @returns {Promise<boolean>} - Success status
   */
  const uploadBlindboxSeriesImages = useCallback(async (seriesId, files) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await blindboxService.uploadBlindboxSeriesImages(seriesId, files);
      
      if (response && response.status === true) {
        message.success('Series images uploaded successfully');
        // Refresh the selected series if needed
        if (selectedSeries && selectedSeries.id === seriesId) {
          await getBlindboxSeriesById(seriesId);
        }
        return true;
      } else {
        throw new Error(response?.message || 'Failed to upload series images');
      }
    } catch (error) {
      console.error(`Error uploading images for blindbox series ${seriesId}:`, error);
      setError(error.message || 'Failed to upload series images');
      message.error(error.message || 'Failed to upload series images');
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
    uploadBlindboxItemImage,
    uploadBlindboxSeriesImages,
    setSelectedSeries
  };
};

export default useBlindboxManagement;