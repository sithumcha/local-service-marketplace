import api from './api';

const providerService = {
  getProviders: async ({ lat, lng, radius, category }) => {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat);
    if (lng) params.append('lng', lng);
    if (radius) params.append('radius', radius);
    if (category) params.append('category', category);

    const response = await api.get(`/providers?${params.toString()}`);
    return response.data;
  },

  getProviderById: async (id) => {
    const response = await api.get(`/providers/${id}`);
    return response.data;
  },

  upsertProfile: async (profileData) => {
    const response = await api.post('/providers/profile', profileData);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/providers/profile/me');
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/services');
    return response.data;
  },
};

export default providerService;
