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
};
  
export default endpoints;