import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

/**
 * Custom hook for accessing cart functionality
 * @returns {Object} Cart context with cart data and operations
 */
const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

export default useCart;