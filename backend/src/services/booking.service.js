import Booking from '../models/Booking.model.js';
import { sendNotification } from './notification.service.js';

export const updateBookingStatus = async (bookingId, newStatus, updaterId) => {
  const booking = await Booking.findById(bookingId)
    .populate('customerId', 'name email phone')
    .populate('providerId', 'name email phone')
    .populate('serviceId', 'name');

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Set new status
  booking.status = newStatus;
  await booking.save();

  // Send status update alert to the opposite party
  const isCustomerUpdater = updaterId.toString() === booking.customerId._id.toString();
  const recipient = isCustomerUpdater ? booking.providerId : booking.customerId;
  const updaterName = isCustomerUpdater ? booking.customerId.name : booking.providerId.name;

  await sendNotification({
    userId: recipient._id,
    title: `Booking status updated to ${newStatus}`,
    message: `Hello ${recipient.name}, the status of your booking request (Job: ${booking.serviceId?.name}) has been updated to "${newStatus}" by ${updaterName}.`,
    type: 'booking',
  });

  // Relay live status updates via Socket.io
  try {
    const { getIO } = await import('../config/socket.js');
    getIO().to(`bookings_room_${recipient._id}`).emit('booking_updated', booking);
  } catch (socketError) {
    console.log('Realtime socket update failed to emit (ignored in developer mode).');
  }

  return booking;
};

