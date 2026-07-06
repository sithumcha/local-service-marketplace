import api from './api';

const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  payBooking: async (id) => {
    const response = await api.post(`/bookings/${id}/pay`);
    return response.data;
  },


  updateBookingStatus: async (id, status) => {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  },

  getUserBookings: async (userId) => {
    const response = await api.get(`/bookings/user/${userId}`);
    return response.data;
  },

  getBookingDetails: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Review & Rating API calls
  submitReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  getProviderReviews: async (providerId) => {
    const response = await api.get(`/reviews/provider/${providerId}`);
    return response.data;
  },

  deleteBooking: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },
};

export default bookingService;
