import { useState, useEffect, useCallback } from 'react';
import blindboxService from '../api/services/blindboxService';

/**
 * Custom hook for managing blindbox data
 * @param {Object} initialParams - Initial search parameters
 * @returns {Object} Blindbox data and functionality
 */
const useBlindbox = (initialParams = {}) => {
  const [blindboxData, setBlindboxData] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 10,
    sort: 'id,desc', // Default sort by ID descending
    ...initialParams,
  });

  /**
   * Fetch blindbox series data
   */
  const fetchBlindboxSeries = useCallback(async (params = searchParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await blindboxService.getAllBlindBoxSeries(params);
      console.log('Response from API:', response);
      
      if (response && response.status === true && response.metadata) {
        // Extract content array
        const content = response.metadata.content || [];
        setBlindboxData(content);
        
        // Update pagination info
        setPagination({
          total: response.metadata.totalElements || 0,
          current: (response.metadata.number || 0) + 1, // Convert zero-based to one-based
          pageSize: response.metadata.size || 10,
          totalPages: response.metadata.totalPages || 0
        });
      } else {
        setError('Failed to fetch blindbox data: ' + (response?.message || 'Unknown error'));
        setBlindboxData([]);
      }
    } catch (err) {
      console.error('Error in fetchBlindboxSeries:', err);
      setError(err.message || 'An error occurred while fetching blindbox data');
      setBlindboxData([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchBlindboxSeries();
  }, [fetchBlindboxSeries]);

  /**
   * Update search parameters and refetch data
   * @param {Object} newParams - New search parameters
   */
  const updateSearchParams = useCallback((newParams) => {
    const updatedParams = { ...searchParams, ...newParams };
    setSearchParams(updatedParams);
    fetchBlindboxSeries(updatedParams);
  }, [searchParams, fetchBlindboxSeries]);

  /**
   * Change page of results
   * @param {number} page - Page number (one-based)
   */
  const changePage = useCallback((page) => {
    updateSearchParams({ page: page - 1 }); // Convert one-based to zero-based
  }, [updateSearchParams]);

  /**
   * Change number of results per page
   * @param {number} size - Number of results per page
   */
  const changePageSize = useCallback((size) => {
    updateSearchParams({ size, page: 0 }); // Reset to first page when changing page size
  }, [updateSearchParams]);

  /**
   * Change sorting of results
   * @param {string} field - Field to sort by
   * @param {string} direction - Sort direction ('asc' or 'desc')
   */
  const changeSort = useCallback((field, direction = 'asc') => {
    updateSearchParams({ sort: `${field},${direction}` });
  }, [updateSearchParams]);

  /**
   * Search by series name
   * @param {string} seriesName - Series name to search for
   */
  const searchByName = useCallback((seriesName) => {
    updateSearchParams({ seriesName, page: 0 }); // Reset to first page when searching
  }, [updateSearchParams]);

  return {
    blindboxData, // This is now the content array directly
    pagination,
    loading,
    error,
    changePage,
    changePageSize,
    changeSort,
    searchByName,
    refetch: fetchBlindboxSeries,
  };
};

export default useBlindbox;