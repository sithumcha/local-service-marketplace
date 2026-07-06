import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import useBookingStore from '../store/useBookingStore';
import useNotificationStore from '../store/useNotificationStore';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { addReceivedMessage } = useChatStore();
  const { fetchUserBookings } = useBookingStore();
  const { addNotification } = useNotificationStore();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    const socketUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

    // 1. Establish the connection sending token inside auth handshake
    const newSocket = io(socketUrl, {
      auth: { token },
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket client connected to server!');
      
      // Join general channels
      newSocket.emit('join_bookings_channel');
    });

    // 2. Set up real-time event listeners
    newSocket.on('message_received', (message) => {
      addReceivedMessage(message);
    });

    newSocket.on('notification_received', (notification) => {
      addNotification(notification);
      if (notification.type === 'booking') {
        fetchUserBookings(user._id);
      }
    });

    newSocket.on('booking_created', (booking) => {
      fetchUserBookings(user._id);
    });

    newSocket.on('booking_updated', (booking) => {
      fetchUserBookings(user._id);
    });

    setSocket(newSocket);

    // Clean up on unmount or authentication state change
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);


  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
