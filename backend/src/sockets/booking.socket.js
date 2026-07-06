export default (io, socket, activeSockets) => {
  // Client joins their personalized booking update notification stream
  socket.on('join_bookings_channel', () => {
    socket.join(`bookings_room_${socket.userId}`);
    console.log(`Socket [${socket.id}] connected to bookings stream for User [${socket.userId}]`);
  });
};
