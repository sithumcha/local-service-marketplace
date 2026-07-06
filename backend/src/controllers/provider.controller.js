import ProviderProfile from '../models/ProviderProfile.model.js';
import User from '../models/User.model.js';

// @desc    Create or update provider profile
// @route   POST /api/providers/profile
// @access  Private/Provider
export const upsertProviderProfile = async (req, res) => {
  try {
    const {

      serviceCategories,
      bio,
      experienceYears,
      certificates,
      hourlyRate,
      availability,
      district,
      city,
    } = req.body;

    // Double check that the user has the 'provider' role
    if (req.user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Only users with the provider role can create a provider profile',
      });
    }

    // Update parent user location if coordinates are supplied
    const { coordinates } = req.body;
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      await User.findByIdAndUpdate(req.user.id, {
        location: {
          type: 'Point',
          coordinates: [Number(coordinates[0]), Number(coordinates[1])],
        }
      });
    }

    // Check if profile already exists
    let profile = await ProviderProfile.findOne({ userId: req.user.id });

    const profileData = {
      userId: req.user.id,
      serviceCategories: serviceCategories || [],
      bio: bio || '',
      experienceYears: experienceYears || 0,
      certificates: certificates || [],
      hourlyRate: hourlyRate || 0,
      availability: availability || [],
      district: district || '',
      city: city || '',
    };


    if (profile) {
      // Update existing profile
      profile = await ProviderProfile.findOneAndUpdate(
        { userId: req.user.id },
        profileData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      profile = await ProviderProfile.create(profileData);
    }

    // Populate user details for frontend response
    await profile.populate('userId', 'name email phone location profileImage');

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current provider's profile
// @route   GET /api/providers/profile/me
// @access  Private/Provider
export const getMyProviderProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user.id })
      .populate('userId', 'name email phone location profileImage')
      .populate('serviceCategories', 'name category');

    if (!profile) {
      return res.status(444).json({
        success: false,
        message: 'Provider profile not found. Please create one.',
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get provider profile by user ID
// @route   GET /api/providers/:id
// @access  Public
export const getProviderById = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.params.id })
      .populate('userId', 'name email phone location profileImage')
      .populate('serviceCategories', 'name category');

    if (!profile) {
      return res.status(444).json({
        success: false,
        message: 'Provider profile not found',
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get providers with coordinates/radius (proximity query)
// @route   GET /api/providers
// @access  Public
export const getProviders = async (req, res) => {
  try {
    const { lat, lng, radius, category } = req.query;

    if (!lat || !lng) {
      // Fallback: If no geolocation coordinates are passed, fetch all provider profiles
      const profiles = await ProviderProfile.find({ isApproved: true })
        .populate('userId', 'name email phone location profileImage')
        .populate('serviceCategories', 'name category icon');
      return res.status(200).json({ success: true, count: profiles.length, profiles });
    }


    // Retrieve from proximity geo-service
    const { findProvidersNearby } = await import('../services/geo.service.js');
    const profiles = await findProvidersNearby({
      lng: Number(lng),
      lat: Number(lat),
      radiusInKm: radius ? Number(radius) : 25, // default 25km radius
      categoryId: category,
    });

    res.status(200).json({
      success: true,
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Self-approve provider profile (Developer Sandbox Bypass)
// @route   POST /api/providers/profile/sandbox-approve
// @access  Private/Provider
export const sandboxApproveMyProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    profile.isApproved = true;
    await profile.save();
    res.status(200).json({ success: true, message: 'Profile self-approved successfully (sandbox mode)', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


