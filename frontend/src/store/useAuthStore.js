import { create } from 'zustand';
import authService from '../services/auth.service';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(credentials);
      set({
        user: data.user,
        isAuthenticated: true,
        loading: false,
      });
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(userData);
      set({
        user: data.user,
        isAuthenticated: true,
        loading: false,
      });
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ user: null, isAuthenticated: false, loading: false });
      return;
    }

    set({ loading: true });
    try {
      const data = await authService.getMe();
      set({
        user: data.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      // If error (e.g. token expired, or refresh token expired)
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      localStorage.removeItem('accessToken');
    }
  },

  clearError: () => set({ error: null }),

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.updateProfile(profileData);
      set({ user: data.user, loading: false });
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update profile details.';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  updatePassword: async (passwordData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.updatePassword(passwordData);
      set({ loading: false });
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update password.';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },
}));

export default useAuthStore;
