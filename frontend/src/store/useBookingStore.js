import { create } from 'zustand';
import bookingService from '../services/booking.service';

const useBookingStore = create((set, get) => ({
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,

  fetchUserBookings: async (userId) => {
    set({ loading: true, error: null });
    try {
      const data = await bookingService.getUserBookings(userId);
      set({ bookings: data.bookings || [], loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchBookingDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await bookingService.getBookingDetails(id);
      set({ currentBooking: data.booking, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createBooking: async (bookingData) => {
    set({ loading: true, error: null });
    try {
      const data = await bookingService.createBooking(bookingData);
      set((state) => ({
        bookings: [data.booking, ...state.bookings],
        loading: false,
      }));
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create booking request';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  payBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await bookingService.payBooking(id);
      set((state) => {
        const updatedBookings = state.bookings.map((b) =>
          b._id === id ? { ...b, isPaid: true, status: 'in-progress' } : b
        );
        const updatedCurrent =
          state.currentBooking?._id === id
            ? { ...state.currentBooking, isPaid: true, status: 'in-progress' }
            : state.currentBooking;
        return {
          bookings: updatedBookings,
          currentBooking: updatedCurrent,
          loading: false,
        };
      });
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to authorize payment escrow hold';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },


  updateStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const data = await bookingService.updateBookingStatus(id, status);
      
      // Update local state arrays
      set((state) => {
        const updatedBookings = state.bookings.map((b) =>
          b._id === id ? { ...b, status: data.booking.status } : b
        );
        const updatedCurrent =
          state.currentBooking?._id === id
            ? { ...state.currentBooking, status: data.booking.status }
            : state.currentBooking;
        return {
          bookings: updatedBookings,
          currentBooking: updatedCurrent,
          loading: false,
        };
      });
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update booking status';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  submitReview: async (reviewData) => {
    set({ loading: true, error: null });
    try {
      const data = await bookingService.submitReview(reviewData);
      set({ loading: false });
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to submit review';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  deleteBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      await bookingService.deleteBooking(id);
      set((state) => ({
        bookings: state.bookings.filter((b) => b._id !== id),
        loading: false,
      }));
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete booking';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },
}));

export default useBookingStore;
