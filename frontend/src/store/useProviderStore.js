import { create } from 'zustand';
import providerService from '../services/provider.service';

const useProviderStore = create((set, get) => ({
  providers: [],
  currentProvider: null,
  categories: [],
  myProfile: null,
  loading: false,
  error: null,

  fetchProviders: async (filters) => {
    set({ loading: true, error: null });
    try {
      const data = await providerService.getProviders(filters);
      set({ providers: data.profiles || [], loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchProviderById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await providerService.getProviderById(id);
      set({ currentProvider: data.profile, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const data = await providerService.getCategories();
      set({ categories: data.services || [], loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMyProviderProfile: async () => {
    set({ loading: true, error: null });
    try {
      const data = await providerService.getMyProfile();
      set({ myProfile: data.profile, loading: false });
      return data;
    } catch (err) {
      // 444 profile not created is managed by the page directly
      set({ loading: false });
      throw err;
    }
  },
}));

export default useProviderStore;
