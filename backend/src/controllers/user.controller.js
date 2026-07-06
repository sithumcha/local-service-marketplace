import User from '../models/User.model.js';

// @desc    Update user profile data
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, coordinates, profileImage } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      user.location = {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])], // [lng, lat]
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
