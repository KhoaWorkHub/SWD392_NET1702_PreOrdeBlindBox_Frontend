import { useState, useCallback } from 'react';
import userService from '../api/services/userService';
import { message } from 'antd';

/**
 * Custom hook for managing users - handles all API calls and state management
 * @returns {Object} User management methods and state
 */
const useUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  /**
   * Fetch users with filtering, pagination, and sorting
   * @param {Object} options - Fetch options
   * @param {number} options.page - Page number (1-based for UI, 0-based for API)
   * @param {number} options.pageSize - Page size
   * @param {Object} options.filters - Filter criteria
   * @param {string} options.sortField - Field to sort by
   * @param {string} options.sortDirection - Sort direction (asc/desc)
   * @returns {Promise<boolean>} - Success status
   */
  const fetchUsers = useCallback(async ({ 
    page = pagination.current, 
    pageSize = pagination.pageSize,
    filters = {},
    sortField = 'id',
    sortDirection = 'desc'
  } = {}) => {
    setLoading(true);
    try {
      // Format the criteria for the backend
      const criteria = {
        currentPage: page - 1, // Convert from 1-based (UI) to 0-based (API)
        pageSize: pageSize,
        sort: `${sortField},${sortDirection}`,
        // Add filter criteria
        name: filters.name || '',
        email: filters.email || '',
        role: filters.role || '',
        isActive: filters.isActive !== undefined ? filters.isActive : null
      };
      
      console.log('Sending user criteria:', criteria);
      
      const response = await userService.getAllUsers(criteria);
      console.log('User API response:', response);
      
      if (response && response.status === true && response.metadata) {
        // Extract data from the response based on your backend structure
        const { data, maxPage, currentPage, total } = response.metadata;
        
        // Set the users data
        setUsers(data || []);
        
        // Update pagination information
        setPagination({
          current: (currentPage || 0) + 1, // Convert from 0-based to 1-based for UI
          pageSize: pageSize,
          total: total || 0,
          totalPages: maxPage || 0
        });
        return true;
      } else {
        message.error('Failed to retrieve user data');
        return false;
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error(error.message || 'Failed to fetch users');
      return false;
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  /**
   * Promote user to staff role
   * @param {number} userId - User ID to promote
   * @returns {Promise<boolean>} - Success status
   */
  const promoteToStaff = useCallback(async (userId) => {
    setLoading(true);
    try {
      const response = await userService.setUserAsStaff(userId);
      
      if (response && response.status === true) {
        message.success('User promoted to staff successfully');
        
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.id === userId) {
              const updatedRoles = [...(user.roles || [])];
              if (!updatedRoles.includes('STAFF')) {
                updatedRoles.push('STAFF');
              }
              return { ...user, roles: updatedRoles };
            }
            return user;
          })
        );
        return true;
      } else {
        throw new Error(response?.message || 'Failed to promote user');
      }
    } catch (error) {
      console.error('Failed to promote user:', error);
      message.error(error.message || 'Failed to promote user to staff');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user active status
   * @param {number} userId - User ID to update
   * @param {boolean} isActive - New active status
   * @returns {Promise<boolean>} - Success status
   */
  const updateUserActiveStatus = useCallback(async (userId, isActive) => {
    setLoading(true);
    try {
      const response = await userService.updateUserActiveStatus(userId, isActive);
      
      if (response && response.status === true) {
        message.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
        
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, isActive } : user
          )
        );
        return true;
      } else {
        throw new Error(response?.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
      message.error(error.message || 'Failed to update user status');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a user
   * @param {number} userId - User ID to delete
   * @returns {Promise<boolean>} - Success status
   */
  const deleteUser = useCallback(async (userId) => {
    setLoading(true);
    try {
      // This is a placeholder until you implement the delete API
      // Replace with actual API call when available:
      // const response = await userService.deleteUser(userId);
      
      // Simulate success for now
      setTimeout(() => {
        message.success('User deleted successfully');
        
        // Remove user from local state
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        setLoading(false);
      }, 500);
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      message.error(error.message || 'Failed to delete user');
      setLoading(false);
      return false;
    }
  }, []);

  /**
   * Update user information
   * @param {number} userId - User ID to update
   * @param {Object} userData - Updated user data
   * @returns {Promise<boolean>} - Success status
   */
  const updateUser = useCallback(async (userId, userData) => {
    setLoading(true);
    try {
      // This is a placeholder until you implement the update API
      // Replace with actual API call when available:
      // const response = await userService.updateUser(userId, userData);
      
      // Simulate success for now
      setTimeout(() => {
        message.success('User updated successfully');
        
        // Update user in local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, ...userData } : user
          )
        );
        setLoading(false);
      }, 500);
      return true;
    } catch (error) {
      console.error('Failed to update user:', error);
      message.error(error.message || 'Failed to update user');
      setLoading(false);
      return false;
    }
  }, []);

  return {
    users,
    pagination,
    loading,
    fetchUsers,
    promoteToStaff,
    updateUserActiveStatus,
    deleteUser,
    updateUser
  };
};

export default useUserManagement;