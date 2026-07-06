import Message from '../models/Message.model.js';
import Chat from '../models/Chat.model.js';

export default (io, socket, activeSockets) => {
  // Client joins the booking-specific chat room
  socket.on('join_chat', ({ chatId }) => {
    socket.join(chatId);
    console.log(`Socket [${socket.id}] joined Chat Room [${chatId}]`);
  });

  // Relay typing status to peers in the room
  socket.on('typing', ({ chatId, isTyping }) => {
    socket.to(chatId).emit('peer_typing', { isTyping, userId: socket.userId });
  });

  // Mark all messages as read for a chat room
  socket.on('mark_all_read', async ({ chatId }) => {
    try {
      await Message.updateMany(
        { chatId, senderId: { $ne: socket.userId }, seen: false },
        { seen: true }
      );
      socket.to(chatId).emit('all_messages_seen', { chatId });
    } catch (error) {
      console.error('Failed to bulk mark seen:', error.message);
    }
  });

  // Relay and save chat message events in real-time
  socket.on('send_message', async ({ chatId, text, attachments, messageType, audioContent }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) return;

      // Persist in DB
      const message = await Message.create({
        chatId,
        senderId: socket.userId,
        text,
        attachments: attachments || [],
        messageType: messageType || 'text',
        audioContent: audioContent || '',
      });

      await message.populate('senderId', 'name profileImage');

      // Send to all sockets currently in the room
      io.to(chatId).emit('message_received', message);
    } catch (error) {
      console.error('Realtime message relay failure:', error.message);
    }
  });
};
