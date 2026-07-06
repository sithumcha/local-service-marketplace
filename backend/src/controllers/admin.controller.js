import User from '../models/User.model.js';
import ProviderProfile from '../models/ProviderProfile.model.js';
import Booking from '../models/Booking.model.js';
import Payment from '../models/Payment.model.js';
import { releaseEscrowPayment, refundEscrowPayment } from '../services/payment.service.js';

// @desc    Get Admin Panel Statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalBookings = await Booking.countDocuments({});
    
    // Calculate total payments released or held
    const payments = await Payment.find({});
    const totalRevenue = payments
      .filter((p) => p.status === 'released')
      .reduce((sum, p) => sum + p.amount, 0);

    // Fetch lists for management
    const pendingProvidersRaw = await ProviderProfile.find({ isApproved: false })
      .populate('userId', 'name email phone location')
      .populate('serviceCategories', 'name');

    const pendingProviders = pendingProvidersRaw.filter(p => p.userId !== null);
    const pendingApprovals = pendingProviders.length;

    const disputes = await Booking.find({ status: 'disputed' })
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone')
      .populate('serviceId', 'name');

    const activeDisputes = disputes.length;

    const allUsers = await User.find({}).sort({ createdAt: -1 });
    const allProviders = await ProviderProfile.find({})
      .populate('userId', 'name email phone location')
      .populate('serviceCategories', 'name');

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalBookings,
        totalRevenue,
        pendingApprovals,
        activeDisputes,
        pendingProviders,
        disputes,
        allUsers,
        allProviders,
      },
    });


  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Approve/Verify a provider's certificate credentials
// @route   POST /api/admin/providers/:profileId/approve
// @access  Private/Admin
export const approveProvider = async (req, res) => {
  try {
    const profile = await ProviderProfile.findById(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    profile.isApproved = true;
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Provider profile approved and badge added successfully',
      profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve a customer/provider booking dispute
// @route   POST /api/admin/bookings/:bookingId/resolve-dispute
// @access  Private/Admin
export const resolveDispute = async (req, res) => {
  try {
    const { action } = req.body; // 'release' or 'refund'
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'disputed') {
      return res.status(400).json({ success: false, message: 'Booking is not currently disputed' });
    }

    if (action === 'release') {
      await releaseEscrowPayment(bookingId);
      booking.status = 'completed';
    } else if (action === 'refund') {
      await refundEscrowPayment(bookingId);
      booking.status = 'cancelled';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Specify release or refund.' });
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Dispute resolved with action: ${action}`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete User
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Delete profile if provider
    if (user.role === 'provider') {
      await ProviderProfile.findOneAndDelete({ userId: user._id });
    }
    await User.findByIdAndDelete(user._id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Provider Profile
// @route   DELETE /api/admin/providers/:profileId
// @access  Private/Admin
export const deleteProviderProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findByIdAndDelete(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }
    res.status(200).json({ success: true, message: 'Provider profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Revoke Provider Approval
// @route   POST /api/admin/providers/:profileId/revoke
// @access  Private/Admin
export const revokeProviderApproval = async (req, res) => {
  try {
    const profile = await ProviderProfile.findById(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }
    profile.isApproved = false;
    await profile.save();
    res.status(200).json({ success: true, message: 'Provider approval status revoked successfully', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users pending KYC verification
// @route   GET /api/admin/kyc-queue
// @access  Private/Admin
export const getKycQueue = async (req, res) => {
  try {
    const queue = await User.find({
      verificationDoc: { $ne: '' },
      isVerified: false,
    });
    res.status(200).json({ success: true, queue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject KYC for a user
// @route   POST /api/admin/users/:userId/verify
// @access  Private/Admin
export const verifyProvider = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (action === 'approve') {
      user.isVerified = true;
    } else if (action === 'reject') {
      user.isVerified = false;
      user.verificationDoc = ''; // Clear document to allow re-upload
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Specify approve or reject.' });
    }

    await user.save();
    res.status(200).json({
      success: true,
      message: `KYC verification status: ${action}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


