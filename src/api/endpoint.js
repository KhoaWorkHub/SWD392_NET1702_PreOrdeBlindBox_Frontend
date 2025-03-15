const endpoints = {
  auth: {
    login: '/users/login',
    register: '/users/register',
    logout: '/users/logout',
  },
  user: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
  },
  blindbox: {
    getAllSeries: '/blindbox', 
    getSeriesById: (id) => `/blindbox/${id}`, 
  },
  cart: {
    getCart: '/cart',
    addToCart: '/cart',
    updateCartItem: (cartItemId, quantity) => `/cart/${cartItemId}?quantity=${quantity}`,
    removeCartItem: (cartItemId) => `/cart/${cartItemId}`,
    clearCart: '/cart'
  }
};
  
export default endpoints;