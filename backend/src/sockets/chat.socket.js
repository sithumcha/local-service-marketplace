import Message from '../models/Message.model.js';
import Chat from '../models/Chat.model.js';

export default (io, socket, activeSockets) => {
  // Client joins the booking-specific chat room
  socket.on('join_chat', ({ chatId }) => {
    socket.join(chatId);
    console.log(`Socket [${socket.id}] joined Chat Room [${chatId}]`);
  });

  // Relay and save chat message events in real-time
  socket.on('send_message', async ({ chatId, text, attachments }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) return;

      // Persist in DB
      const message = await Message.create({
        chatId,
        senderId: socket.userId,
        text,
        attachments: attachments || [],
      });

      await message.populate('senderId', 'name profileImage');

      // Send to all sockets currently in the room
      io.to(chatId).emit('message_received', message);
    } catch (error) {
      console.error('Realtime message relay failure:', error.message);
    }
  });
};
