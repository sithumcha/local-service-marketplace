import { create } from 'zustand';
import api from '../services/api';

const useChatStore = create((set, get) => ({
  chats: [],
  messages: [],
  currentChat: null,
  loading: false,
  error: null,

  fetchChats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/chat');
      set({ chats: res.data.chats || [], loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchChatMessages: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/chat/${bookingId}/messages`);
      set({
        currentChat: res.data.chat,
        messages: res.data.messages || [],
        loading: false,
      });
      return res.data;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  sendMessage: async (chatId, text, attachments = []) => {
    try {
      const res = await api.post(`/chat/${chatId}/messages`, { text, attachments });
      // In real-time mode, message_received socket will append the message.
      // But we can append it locally if socket falls back.
      return res.data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // Realtime append helper triggered by WebSocket listener
  addReceivedMessage: (message) => {
    const { messages, currentChat } = get();
    // Only append if the message belongs to the current open chat room
    if (currentChat && message.chatId === currentChat._id) {
      set({
        messages: [...messages, message],
      });
    }
  },
}));

export default useChatStore;
