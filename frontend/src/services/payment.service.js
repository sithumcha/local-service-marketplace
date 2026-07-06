import api from './api';

const paymentService = {
  createIntent: async (bookingId, amount) => {
    const response = await api.post('/payments/create-intent', { bookingId, amount });
    return response.data;
  },

  releasePayout: async (bookingId) => {
    const response = await api.post(`/payments/release/${bookingId}`);
    return response.data;
  },

  getPaymentHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  },
};

export default paymentService;
