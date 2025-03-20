const endpoints = {
  auth: {
    login: '/users/login',
    register: '/users/signup',
    logout: '/users/logout',
    forgotPassword: '/users/forgot-password',
    resendOTP: '/users/resend-otp',
    confirmOTP: '/users/confirm-otp'
  },
  user: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    getAll: '/users',
    setStaff: (id) => `/users/${id}/set-staff`,
    updateActiveStatus: (id) => `/users/${id}/active-status`
  },
  cart: {
    getCart: '/cart',
    addToCart: '/cart',
    updateCartItem: (cartItemId, quantity) => `/cart/${cartItemId}?quantity=${quantity}`,
    removeCartItem: (cartItemId) => `/cart/${cartItemId}`,
    clearCart: '/cart'
  },
  checkout: {
    getCheckoutInfo: '/checkout',
    processCheckout: '/checkout/deposit',
    paymentCallback: '/payment/vn-pay-callback',
    verifyPayment: (preorderId) => `/remaining-amount/${preorderId}`
  },
  preorders: {
    getHistory: '/preorders',
    getDetails: (id) => `/preorders/${id}`
  },
  campaign: {
    create: '/campaigns',
    getSeriesCampaigns: (seriesId) => `/campaigns/series/${seriesId}`,
    getCampaignDetails: (campaignId) => `/campaigns/${campaignId}`,
    endCampaign: (campaignId) => `/campaigns/${campaignId}/end`
  },
  blindbox: {
    getAllSeries: '/blindbox', 
    getSeriesById: (id) => `/blindbox/${id}`,
    createSeries: '/blindbox',  
    updateSeries: (id) => `/blindbox/${id}`,
    deleteSeries: (id) => `/blindbox/${id}`,
    uploadItemImages: (itemId) => `/blindbox/items/${itemId}/images`,
    uploadSeriesImages: (seriesId) => `/blindbox/${seriesId}/images`
  },
};
  
export default endpoints;