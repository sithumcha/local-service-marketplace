import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  startTime: {
    type: String, // HH:MM format e.g. "08:00"
    required: true,
  },
  endTime: {
    type: String, // HH:MM format e.g. "17:00"
    required: true,
  },
});

const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    serviceCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: [0, 'Experience years cannot be negative'],
    },
    certificates: [
      {
        type: String, // URLs of certificates uploaded (e.g. Cloudinary)
      },
    ],
    hourlyRate: {
      type: Number,
      required: [true, 'Please add an hourly rate'],
      min: [0, 'Hourly rate cannot be negative'],
    },
    availability: [availabilitySchema],
    district: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    ratingAvg: {

      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ProviderProfile = mongoose.model('ProviderProfile', providerProfileSchema);

export default ProviderProfile;
