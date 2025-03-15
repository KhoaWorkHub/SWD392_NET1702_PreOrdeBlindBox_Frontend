import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { message } from "antd";
import cartService from "../api/services/cartService";
import { AuthContext } from "./AuthContext";

// Create cart context
export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartInitialized, setCartInitialized] = useState(false);

  const { isAuthenticated } = useContext(AuthContext);

  // Map API response to CartPage expected format
  const mapCartItems = useCallback((items) => {
    if (!items || !Array.isArray(items)) {
      return [];
    }

    return items.map((item) => ({
      id: item.id,
      key: item.id,
      productId: item.series?.id,
      name: item.series?.seriesName || `Blindbox #${item.series?.id}`,
      imageUrl: item.series?.seriesImageUrls?.[0] || null,
      price: item.discountedPrice || item.price,
      quantity: item.quantity,
      productType: item.productType,
      // Keep original item data for reference if needed
      originalItem: item,
    }));
  }, []);

  // Calculate and update totals immediately
  const updateTotals = useCallback((items) => {
    if (!items || !Array.isArray(items)) {
      setItemCount(0);
      setTotalPrice(0);
      return;
    }

    // Calculate item count
    const count = items.reduce(
      (total, item) => total + (item.quantity || 0),
      0
    );

    // Calculate total price
    let calculatedTotal = 0;
    for (const item of items) {
      const price = item.price || 0;
      const qty = item.quantity || 0;
      calculatedTotal += price * qty;
    }

    // Force synchronous updates
    setItemCount(count);
    setTotalPrice(calculatedTotal);

    console.log("Updated totals:", { count, calculatedTotal });
  }, []);

  // Fetch cart data with enhanced error handling
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setCartItems([]);
      setItemCount(0);
      setTotalPrice(0);
      setCartInitialized(false);
      return false;
    }

    if (loading) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await cartService.getCart();
      if (response && response.status === true && response.metadata) {
        // Map API response to expected format
        const mappedItems = mapCartItems(response.metadata.cartItems || []);

        // Set state with all updates
        setCart(response.metadata);
        setCartItems(mappedItems);

        // If API provides totalPrice, use it, otherwise calculate
        if (response.metadata.totalPrice) {
          setTotalPrice(response.metadata.totalPrice);
          const count = mappedItems.reduce(
            (total, item) => total + (item.quantity || 0),
            0
          );
          setItemCount(count);
        } else {
          updateTotals(mappedItems);
        }

        setCartInitialized(true);
        return true;
      } else {
        console.error("Invalid cart response format:", response);
        throw new Error("Failed to load cart data");
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError(err.message || "An error occurred while fetching your cart");
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loading, mapCartItems, updateTotals]);

  // Initialize cart on auth status change
  useEffect(() => {
    if (isAuthenticated && !cartInitialized) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart, cartInitialized]);

  // Add item to cart with enhanced error handling
  const addToCart = async (productId, quantity = 1, isPackage = false) => {
    if (!isAuthenticated) {
      message.warning("Please login to add items to cart");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await cartService.addToCart(
        productId,
        quantity,
        isPackage
      );

      if (response && response.status === true && response.metadata) {
        // Map API response to expected format
        const mappedItems = mapCartItems(response.metadata.cartItems || []);

        // Set state with all updates
        setCart(response.metadata);
        setCartItems(mappedItems);

        // If API provides totalPrice, use it, otherwise calculate
        if (response.metadata.totalPrice) {
          setTotalPrice(response.metadata.totalPrice);
          const count = mappedItems.reduce(
            (total, item) => total + (item.quantity || 0),
            0
          );
          setItemCount(count);
        } else {
          updateTotals(mappedItems);
        }

        setCartInitialized(true);
        message.success("Item added to cart successfully");
        return true;
      } else {
        setError("Failed to add item to cart");
        message.error("Failed to add item to cart");
        return false;
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError(err.message || "An error occurred while adding to cart");
      message.error(err.message || "An error occurred while adding to cart");

      // If we failed to add to cart but have existing cart, refresh it
      if (cartInitialized) {
        await fetchCart();
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity with immediate UI update
  const updateCartItemQuantity = async (cartItemId, quantity) => {
    if (!isAuthenticated) {
      message.warning("Please login to update your cart");
      return false;
    }

    if (!cartInitialized) {
      await fetchCart();
      return false;
    }

    // Create a copy of the current items
    const updatedItems = cartItems.map((item) => {
      if (item.id === cartItemId) {
        return { ...item, quantity: quantity };
      }
      return item;
    });

    // Immediately update the UI with the new quantity and totals
    setCartItems(updatedItems);
    updateTotals(updatedItems);

    // Now make the API call
    setLoading(true);
    setError(null);

    try {
      const response = await cartService.updateCartItemQuantity(
        cartItemId,
        quantity
      );

      if (response && response.status === true && response.metadata) {
        // Update with the server response to ensure consistency
        const serverMappedItems = mapCartItems(
          response.metadata.cartItems || []
        );

        setCart(response.metadata);
        setCartItems(serverMappedItems);

        // If API provides totalPrice, use it, otherwise calculate
        if (response.metadata.totalPrice) {
          setTotalPrice(response.metadata.totalPrice);
          const count = serverMappedItems.reduce(
            (total, item) => total + (item.quantity || 0),
            0
          );
          setItemCount(count);
        } else {
          updateTotals(serverMappedItems);
        }

        message.success("Cart updated successfully");
        return true;
      } else {
        // If the server response is invalid, revert to the original state
        await fetchCart();
        setError("Failed to update cart");
        message.error("Failed to update cart");
        return false;
      }
    } catch (err) {
      // On error, revert to the original state
      await fetchCart();
      console.error("Error updating cart:", err);
      setError(err.message || "An error occurred while updating cart");
      message.error(err.message || "An error occurred while updating cart");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeCartItem = async (cartItemId) => {
    if (!isAuthenticated) {
      message.warning("Please login to manage your cart");
      return false;
    }

    if (!cartInitialized) {
      await fetchCart();
      return false;
    }

    // Create a copy of the current items without the removed item
    const updatedItems = cartItems.filter((item) => item.id !== cartItemId);

    // Immediately update the UI
    setCartItems(updatedItems);
    updateTotals(updatedItems);

    setLoading(true);
    setError(null);

    try {
      const response = await cartService.removeCartItem(cartItemId);

      if (response && response.status === true && response.metadata) {
        // Update with the server response to ensure consistency
        const serverMappedItems = mapCartItems(
          response.metadata.cartItems || []
        );

        setCart(response.metadata);
        setCartItems(serverMappedItems);

        // If API provides totalPrice, use it, otherwise calculate
        if (response.metadata.totalPrice) {
          setTotalPrice(response.metadata.totalPrice);
          const count = serverMappedItems.reduce(
            (total, item) => total + (item.quantity || 0),
            0
          );
          setItemCount(count);
        } else {
          updateTotals(serverMappedItems);
        }

        message.success("Item removed from cart");
        return true;
      } else {
        // If the server response is invalid, revert to the original state
        await fetchCart();
        setError("Failed to remove item from cart");
        message.error("Failed to remove item from cart");
        return false;
      }
    } catch (err) {
      // On error, revert to the original state
      await fetchCart();
      console.error("Error removing from cart:", err);
      setError(
        err.message || "An error occurred while removing item from cart"
      );
      message.error(
        err.message || "An error occurred while removing item from cart"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!isAuthenticated) {
      message.warning("Please login to manage your cart");
      return false;
    }

    if (!cartInitialized) {
      await fetchCart();
      return false;
    }

    // Immediately update the UI
    setCartItems([]);
    setItemCount(0);
    setTotalPrice(0);

    setLoading(true);
    setError(null);

    try {
      const response = await cartService.clearCart();

      if (response && response.status === true && response.metadata) {
        setCart(response.metadata);
        message.success("Cart cleared successfully");
        return true;
      } else {
        // If the server response is invalid, revert to the original state
        await fetchCart();
        setError("Failed to clear cart");
        message.error("Failed to clear cart");
        return false;
      }
    } catch (err) {
      // On error, revert to the original state
      await fetchCart();
      console.error("Error clearing cart:", err);
      setError(err.message || "An error occurred while clearing cart");
      message.error(err.message || "An error occurred while clearing cart");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Value to be provided to consuming components
  const value = {
    cart,
    cartItems,
    itemCount,
    totalPrice,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
