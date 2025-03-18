import { createContext, useState, useEffect } from 'react';
import authService from '../api/services/authService';

// Create auth context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      try {
        const isAuthenticated = authService.isAuthenticated();
        if (isAuthenticated) {
          // Get user role from localStorage
          const userRole = localStorage.getItem('user');
          setUser(userRole ? userRole : null);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      // Update user state after successful login
      if (response && response.metadata && response.metadata.roles) {
        setUser(response.metadata.roles);
      }
      
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.includes(role);
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.some(role => user.includes(role));
  };

  // Auth context value
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAdmin: user ? user.includes('ADMIN') : false,
    isStaff: user ? user.includes('STAFF') : false,
    isCustomer: user ? user.includes('CUSTOMER') : false
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};