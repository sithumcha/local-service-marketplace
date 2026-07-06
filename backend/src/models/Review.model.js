import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // Only one review per booking
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to calculate average rating and update ProviderProfile
reviewSchema.statics.calculateAverageRating = async function (providerId) {
  const stats = await this.aggregate([
    {
      $match: { providerId },
    },
    {
      $group: {
        _id: '$providerId',
        ratingAvg: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('ProviderProfile').findOneAndUpdate(
        { userId: providerId },
        {
          ratingAvg: Math.round(stats[0].ratingAvg * 10) / 10,
          totalReviews: stats[0].totalReviews,
        }
      );
    } else {
      await mongoose.model('ProviderProfile').findOneAndUpdate(
        { userId: providerId },
        {
          ratingAvg: 0,
          totalReviews: 0,
        }
      );
    }
  } catch (err) {
    console.error('Error updating average rating:', err);
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.providerId);
});

// Call calculateAverageRating before remove
reviewSchema.post('remove', async function () {
  await this.constructor.calculateAverageRating(this.providerId);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
