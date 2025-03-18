import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Result, Spin } from 'antd';
import useAuth from '../../../hooks/useAuth';

/**
 * ProtectedRoute - Route protection component that restricts access based on user roles
 * 
 * @param {Object} props - Component props
 * @param {string[]} props.allowedRoles - Array of roles allowed to access the route
 * @param {string} props.redirectPath - Path to redirect to if access is denied (default: '/')
 * @returns {JSX.Element} Protected route component
 */
const ProtectedRoute = ({ allowedRoles, redirectPath = '/' }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has any of the allowed roles
  const hasRequiredRole = allowedRoles.some(role => user && user.includes(role));
  
  // If user doesn't have the required role, show unauthorized message or redirect
  if (!hasRequiredRole) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Navigate to={redirectPath} replace />
        }
      />
    );
  }
  
  // If authenticated and has role, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;