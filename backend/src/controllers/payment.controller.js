import Payment from '../models/Payment.model.js';
import Booking from '../models/Booking.model.js';
import {
  createEscrowPayment,
  releaseEscrowPayment,
  refundEscrowPayment,
} from '../services/payment.service.js';

// @desc    Create a payment hold intent
// @route   POST /api/payments/create-intent
// @access  Private/Customer
export const createIntent = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const payment = await createEscrowPayment(bookingId, amount);

    res.status(211).json({
      success: true,
      message: 'Escrow payment hold authorized',
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Release held escrow funds to provider
// @route   POST /api/payments/release/:bookingId
// @access  Private/Admin
export const releaseHeldPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Check admin or provider role permission
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.id !== booking.providerId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to request payout release' });
    }

    const payment = await releaseEscrowPayment(bookingId);

    res.status(200).json({
      success: true,
      message: 'Payment released successfully to provider',
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment transactions logs for user
// @route   GET /api/payments/history
// @access  Private
export const getMyPaymentHistory = async (req, res) => {
  try {
    // Resolve booking IDs owned by user
    const bookings = await Booking.find({
      $or: [{ customerId: req.user.id }, { providerId: req.user.id }],
    });

    const bookingIds = bookings.map((b) => b._id);

    const payments = await Payment.find({
      bookingId: { $in: bookingIds },
    })
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'customerId', select: 'name email' },
          { path: 'providerId', select: 'name email' },
          { path: 'serviceId', select: 'name' },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
