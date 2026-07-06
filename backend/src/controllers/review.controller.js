import Review from '../models/Review.model.js';
import Booking from '../models/Booking.model.js';

// @desc    Submit a review for a completed booking
// @route   POST /api/reviews
// @access  Private/Customer
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // 1. Ensure the user submitting is the customer who requested the booking
    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this booking',
      });
    }

    // 2. Ensure reviews are only allowed on completed bookings
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed service jobs',
      });
    }

    // Check if review already exists
    const reviewExists = await Review.findOne({ bookingId });
    if (reviewExists) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking',
      });
    }

    const review = await Review.create({
      bookingId,
      customerId: req.user.id,
      providerId: booking.providerId,
      rating,
      comment,
    });

    res.status(211).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
export const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    const reviews = await Review.find({ providerId })
      .populate('customerId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
