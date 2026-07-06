import Booking from '../models/Booking.model.js';
import { updateBookingStatus as updateStatusService } from '../services/booking.service.js';
import { createEscrowPayment, releaseEscrowPayment, refundEscrowPayment } from '../services/payment.service.js';
import Chat from '../models/Chat.model.js';
import ProviderProfile from '../models/ProviderProfile.model.js';

// @desc    Create a booking request
// @route   POST /api/bookings
// @access  Private/Customer
export const createBooking = async (req, res) => {
  try {
    const { providerId, serviceId, scheduledDate, address, coordinates, price, paymentMethod, isPaid } = req.body;

    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Only customers can request bookings' });
    }

    // Schedule validation checks
    const reqStart = new Date(scheduledDate);
    const reqEnd = new Date(reqStart.getTime() + 2 * 60 * 60 * 1000); // Assume standard 2 hour duration

    // 1. Check if provider has marked this slot as busy
    const providerProfile = await ProviderProfile.findOne({ userId: providerId });
    if (providerProfile && providerProfile.busySlots && providerProfile.busySlots.length > 0) {
      const isBusy = providerProfile.busySlots.some((slot) => {
        const slotStart = new Date(slot.start);
        const slotEnd = new Date(slot.end);
        return reqStart < slotEnd && reqEnd > slotStart;
      });

      if (isBusy) {
        return res.status(400).json({
          success: false,
          message: 'The provider has marked this time slot as busy/unavailable. Please choose another time.',
        });
      }
    }

    // 2. Check for overlapping active bookings (pending, accepted, in-progress)
    const overlapping = await Booking.findOne({
      providerId,
      status: { $in: ['pending', 'accepted', 'in-progress'] },
      scheduledDate: {
        $gte: new Date(reqStart.getTime() - 2 * 60 * 60 * 1000), // 2 hours before
        $lte: new Date(reqStart.getTime() + 2 * 60 * 60 * 1000), // 2 hours after
      },
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: 'The provider has an overlapping booking request or active job scheduled within this 2-hour window.',
      });
    }

    // 1. Create the booking entry in MongoDB
    const booking = await Booking.create({
      customerId: req.user.id,
      providerId,
      serviceId,
      scheduledDate,
      address,
      location: {
        type: 'Point',
        coordinates: coordinates || [79.8612, 6.9271],
      },
      price,
      paymentMethod: paymentMethod || 'card',
      isPaid: paymentMethod === 'card' ? (isPaid || false) : false,
      status: 'pending',
    });

    // If paid on checkout, register the escrow payment hold immediately
    if (booking.isPaid) {
      try {
        const { createEscrowPayment } = await import('../services/payment.service.js');
        await createEscrowPayment(booking._id, booking.price);
      } catch (payErr) {
        console.log('Escrow payment initialization on checkout failed:', payErr.message);
      }
    }

    // Create Chat channel immediately so customer and provider can discuss pending details
    try {
      await Chat.create({
        participants: [req.user.id, providerId],
        bookingId: booking._id,
      });
    } catch (chatError) {
      console.log('Error creating chat channel on booking request:', chatError.message);
    }

    // 2. Dispatch persistent notification and email alert


    try {
      const { sendNotification } = await import('../services/notification.service.js');
      await sendNotification({
        userId: providerId,
        title: 'New Booking Request 🛠',
        message: `You have received a new service booking request for LKR ${price}. Check your dashboard to accept or decline.`,
        type: 'booking',
      });
    } catch (err) {
      console.log('Persistent notification creation failed:', err.message);
    }

    // 3. Notify provider of the new booking request in real-time
    try {
      const { getIO } = await import('../config/socket.js');
      getIO().to(`bookings_room_${providerId}`).emit('booking_created', booking);
    } catch (socketError) {
      console.log('Realtime socket creation alert failed to emit.');
    }

    res.status(211).json({
      success: true,
      message: 'Booking request sent successfully',
      booking,
    });


  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authorize and hold escrow payment for accepted booking
// @route   POST /api/bookings/:id/pay
// @access  Private/Customer
export const payBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Booking must be accepted before payment' });
    }

    if (booking.isPaid) {
      return res.status(400).json({ success: false, message: 'Booking is already paid' });
    }

    // Place escrow hold
    await createEscrowPayment(booking._id, booking.price);

    booking.isPaid = true;
    booking.status = 'in-progress';
    await booking.save();

    // Dispatch notification
    try {
      const { sendNotification } = await import('../services/notification.service.js');
      await sendNotification({
        userId: booking.providerId,
        title: 'Escrow Payment Secured 💰',
        message: `Payment for booking #${booking._id.toString().slice(-6)} is secured in escrow. You can start the service now.`,
        type: 'booking',
      });
    } catch (err) {
      console.log('Payment notification failed:', err.message);
    }

    res.status(200).json({
      success: true,
      message: 'Escrow payment hold authorized, job is now in-progress',
      booking,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status (accept, complete, cancel)
// @route   PATCH /api/bookings/:id/status
// @desc    Update booking status (accept, complete, cancel)
// @route   PATCH /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization checks
    const isCustomer = req.user.id === booking.customerId.toString();
    const isProvider = req.user.id === booking.providerId.toString();

    if (!isCustomer && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to change this booking' });
    }

    let targetStatus = status;

    // Status transitions checks
    if (status === 'accepted') {
      if (!isProvider && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only providers can accept booking requests' });
      }

      // Automatically create a Chat channel when accepted
      const chatExists = await Chat.findOne({ bookingId });
      if (!chatExists) {
        await Chat.create({
          participants: [booking.customerId, booking.providerId],
          bookingId: booking._id,
        });
      }

      // If cash payment method OR already paid via card on booking request, go straight to in-progress
      if (booking.paymentMethod === 'cash' || booking.isPaid) {
        targetStatus = 'in-progress';
      }

      // Notify customer
      try {
        const { sendNotification } = await import('../services/notification.service.js');
        await sendNotification({
          userId: booking.customerId,
          title: 'Booking Request Accepted ✅',
          message: booking.paymentMethod === 'cash' 
            ? `Your booking request has been accepted by the provider as a Cash Payout. The job is now in-progress!`
            : `Your booking request has been accepted by the provider. Please authorize the escrow payment hold to start the job.`,
          type: 'booking',
        });
      } catch (err) {
        console.log('Acceptance notification failed:', err.message);
      }
    } else if (status === 'completed') {

      if (isProvider) {
        // Provider marking complete - flag it and wait for customer confirmation
        booking.providerMarkedComplete = true;
        await booking.save();
        
        // Notify customer
        const { sendNotification } = await import('../services/notification.service.js');
        await sendNotification({
          userId: booking.customerId,
          title: 'Service marked complete by provider 🛠',
          message: 'The provider has marked the job complete. Please review and confirm on your dashboard to release the payout.',
          type: 'booking',
        });

        return res.status(200).json({
          success: true,
          message: 'Job marked completed, waiting customer confirmation',
          booking,
        });
      }

      // Customer confirming complete - release funds and complete booking
      if (booking.isPaid) {
        await releaseEscrowPayment(bookingId);
      }

      // Notify provider
      try {
        const { sendNotification } = await import('../services/notification.service.js');
        await sendNotification({
          userId: booking.providerId,
          title: 'Payout Released 💸',
          message: `The customer confirmed job completion. Escrow funds LKR ${booking.price} have been released to your account.`,
          type: 'booking',
        });
      } catch (err) {
        console.log('Completion notification failed:', err.message);
      }
    } else if (status === 'cancelled') {
      // Refund escrow payment if paid
      if (booking.isPaid) {
        await refundEscrowPayment(bookingId);
      }

      // Notify recipient
      try {
        const { sendNotification } = await import('../services/notification.service.js');
        const cancellerName = req.user.role === 'customer' ? 'customer' : 'provider';
        const recipientId = req.user.role === 'customer' ? booking.providerId : booking.customerId;
        await sendNotification({
          userId: recipientId,
          title: 'Booking Cancelled ❌',
          message: `Booking #${booking._id.toString().slice(-6)} has been cancelled by the ${cancellerName}. Escrow holds are refunded.`,
          type: 'booking',
        });
      } catch (err) {
        console.log('Cancellation notification failed:', err.message);
      }
    }


    // Call service to update state in DB & dispatch notification alerts
    const updatedBooking = await updateStatusService(bookingId, targetStatus, req.user.id);

    res.status(200).json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get user bookings (both customer & provider views)
// @route   GET /api/bookings/user/:userId
// @access  Private
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view these bookings' });
    }

    const bookings = await Booking.find({
      $or: [{ customerId: userId }, { providerId: userId }],
    })
      .populate('customerId', 'name email phone profileImage')
      .populate('providerId', 'name email phone profileImage')
      .populate('serviceId', 'name category icon')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email phone location profileImage')
      .populate('providerId', 'name email phone location profileImage')
      .populate('serviceId', 'name category icon');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check permissions
    if (
      req.user.id !== booking.customerId._id.toString() &&
      req.user.id !== booking.providerId._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a booking record (and associated chat history)
// @route   DELETE /api/bookings/:id
// @access  Private
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership
    if (
      booking.customerId.toString() !== req.user.id &&
      booking.providerId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
    }

    // Only allow deleting cancelled or completed bookings to prevent breaking active escrow holds
    if (booking.status !== 'cancelled' && booking.status !== 'completed' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Only completed or cancelled bookings can be deleted from dashboard history',
      });
    }

    // Clean up associated Chat room and Messages
    try {
      const Chat = (await import('../models/Chat.model.js')).default;
      const Message = (await import('../models/Message.model.js')).default;
      
      const chat = await Chat.findOne({ bookingId: booking._id });
      if (chat) {
        await Message.deleteMany({ chatId: chat._id });
        await Chat.findByIdAndDelete(chat._id);
      }
    } catch (cleanError) {
      console.log('Error cleaning up chat associated with deleted booking:', cleanError.message);
    }

    await Booking.findByIdAndDelete(booking._id);

    res.status(200).json({
      success: true,
      message: 'Booking and associated chat history deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

