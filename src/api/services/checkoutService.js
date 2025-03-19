import axiosInstance from "../axios";
import endpoints from "../endpoint";

/**
 * Service for handling Checkout related API calls
 */
const checkoutService = {
    /**
   * Get checkout information for the current cart
   * @returns {Promise} - Promise with response data containing checkout information
   */
    getCheckoutInfo: async () => {
      try {
        const response = await axiosInstance.get(endpoints.checkout.getCheckoutInfo);
        return response.data;
      } catch (error) {
        console.error("Error fetching checkout info:", error);
        throw error.response?.data || { 
          message: "An error occurred while fetching checkout information. Please try again." 
        };
      }
    },
  /**
   * Process checkout with user's shipping information
   * 
   * @param {Object} checkoutData - Checkout information
   * @param {string} checkoutData.phoneNumber - Customer's phone number (10 digits)
   * @param {string} checkoutData.userAddress - Customer's shipping address
   * @returns {Promise} - Promise with response data containing payment URL
   */
  processCheckout: async (checkoutData) => {
    try {
      const response = await axiosInstance.post(endpoints.checkout.processCheckout, checkoutData);
      return response.data;
    } catch (error) {
      console.error("Error processing checkout:", error);
      throw error.response?.data || {
        message: "An error occurred while processing your order. Please try again."
      };
    }
  },

  /**
   * Verify payment status after returning from payment gateway
   * 
   * @param {string} preorderId - ID of the preorder 
   * @returns {Promise} - Promise with response data containing confirmation
   */
  verifyPayment: async (preorderId) => {
    try {
      const response = await axiosInstance.get(endpoints.checkout.verifyPayment(preorderId));
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error.response?.data || {
        message: "An error occurred while verifying your payment. Please contact customer support."
      };
    }
  }
};

export default checkoutService;