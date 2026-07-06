import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
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
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Please specify the scheduled date and time'],
    },
    address: {
      type: String,
      required: [true, 'Please provide the service location address'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled', 'disputed'],
      default: 'pending',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    providerMarkedComplete: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, 'Please add a service price'],
      min: [0, 'Price cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash'],
      default: 'card',
    },
  },
  {
    timestamps: true,
  }
);


// Geo-indexing on coordinates for proximity searches near customer locations
bookingSchema.index({ location: '2dsphere' });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
