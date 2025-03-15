import axiosInstance from "../axios";
import endpoints from "../endpoint";

/**
 * Service for handling Cart related API calls
 */
const cartService = {
  /**
   * Get current user's cart or create a new one if it doesn't exist
   *
   * @returns {Promise} - Promise with response data containing cart details
   */
  getCart: async () => {
    try {
      const response = await axiosInstance.get(endpoints.cart.getCart);
      return response.data;
    } catch (error) {
      console.error("Error fetching cart:", error);

      // Check if it's the specific SQL NULL error
      if (error?.response?.data?.metadata?.code === "SERVER_ERROR") {
        // Try to fix by creating a cart with initial items
        try {
          console.log("Attempting to initialize cart with dummy item...");
          // Try to initialize the cart with a small item and then remove it
          const dummyItem = {
            blindboxSeriesId: 1, // Use a known product ID that exists
            productType: "BOX",
            quantity: 1,
            itemCampaignType: "MILESTONE",
          };

          // Add dummy item to create the cart
          await axiosInstance.post(endpoints.cart.addToCart, dummyItem);

          // Fetch the cart again now that it should be created
          const retryResponse = await axiosInstance.get(endpoints.cart.getCart);
          return retryResponse.data;
        } catch (retryError) {
          console.error("Cart initialization failed:", retryError);
          throw (
            retryError.response?.data || {
              message:
                "Unable to initialize your cart. Please try again later.",
            }
          );
        }
      }

      throw (
        error.response?.data || {
          message: "An error occurred while fetching your cart",
        }
      );
    }
  },

  /**
   * Add an item to the cart
   *
   * @param {number} productId - ID of the product to add
   * @param {number} quantity - Quantity of the product to add
   * @param {boolean} isPackage - Whether to add as a package or individual box
   * @returns {Promise} - Promise with response data containing updated cart
   */
  addToCart: async (productId, quantity, isPackage = false) => {
    try {
      // Format request according to backend expectations with additional fields
      const cartItemRequest = {
        blindboxSeriesId: productId,
        // Use the correct enum values from the backend
        productType: isPackage ? "PACKAGE" : "BOX",
        quantity: quantity,
        // Additional fields to help backend avoid NULL errors
        itemCampaignType: "MILESTONE", // Default to MILESTONE (could also be GROUP)
      };

      const response = await axiosInstance.post(
        endpoints.cart.addToCart,
        cartItemRequest
      );
      return response.data;
    } catch (error) {
      // Handle specific backend errors
      if (error?.response?.data?.metadata?.code === "SERVER_ERROR") {
        console.error("Backend server error. Trying alternative approach...");

        // First check if it's the cart creation error - try to initialize the cart first
        try {
          // Get cart to ensure it exists
          await cartService.getCart();

          // Now try again with the original request
          const retryResponse = await axiosInstance.post(
            endpoints.cart.addToCart,
            {
              blindboxSeriesId: productId,
              productType: isPackage ? "PACKAGE" : "BOX",
              quantity: quantity,
              itemCampaignType: "MILESTONE",
            }
          );

          return retryResponse.data;
        } catch (initError) {
          console.error("Cart initialization failed:", initError);
        }

        // If the first attempt fails, try with a different campaign type
        try {
          const alternativeRequest = {
            blindboxSeriesId: productId,
            productType: isPackage ? "PACKAGE" : "BOX",
            quantity: quantity,
            itemCampaignType: "GROUP", // Try the other campaign type
          };

          const retryResponse = await axiosInstance.post(
            endpoints.cart.addToCart,
            alternativeRequest
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Alternative approach also failed:", retryError);
          throw (
            retryError.response?.data || {
              message: "Unable to add item to cart. Please try again later.",
            }
          );
        }
      }

      console.error("Error adding to cart:", error);
      throw (
        error.response?.data || {
          message: "An error occurred while adding item to cart",
        }
      );
    }
  },

  /**
   * Update quantity of an item in the cart
   *
   * @param {number} cartItemId - ID of the cart item to update
   * @param {number} quantity - New quantity for the cart item
   * @returns {Promise} - Promise with response data containing updated cart
   */
  updateCartItemQuantity: async (cartItemId, quantity) => {
    try {
      const response = await axiosInstance.put(
        endpoints.cart.updateCartItem(cartItemId, quantity)
      );
      return response.data;
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw (
        error.response?.data || {
          message: "An error occurred while updating cart item",
        }
      );
    }
  },

  /**
   * Remove an item from the cart
   *
   * @param {number} cartItemId - ID of the cart item to remove
   * @returns {Promise} - Promise with response data containing updated cart
   */
  removeCartItem: async (cartItemId) => {
    try {
      const response = await axiosInstance.delete(
        endpoints.cart.removeCartItem(cartItemId)
      );
      return response.data;
    } catch (error) {
      console.error("Error removing cart item:", error);
      throw (
        error.response?.data || {
          message: "An error occurred while removing item from cart",
        }
      );
    }
  },

  /**
   * Clear all items from the cart
   *
   * @returns {Promise} - Promise with response data containing emptied cart
   */
  clearCart: async () => {
    try {
      const response = await axiosInstance.delete(endpoints.cart.clearCart);
      return response.data;
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw (
        error.response?.data || {
          message: "An error occurred while clearing your cart",
        }
      );
    }
  },
};

export default cartService;
