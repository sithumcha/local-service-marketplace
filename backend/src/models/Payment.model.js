import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please specify the payment amount'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['held', 'released', 'refunded'],
      default: 'held',
    },
    paymentMethod: {
      type: String,
      default: 'card',
    },
    transactionId: {
      type: String,
      required: [true, 'Please provide the transaction ID'],
    },
    escrowReleaseDate: {
      type: Date,
    },
    commissionRate: {
      type: Number,
      default: 0.10, // 10% standard rate
    },
    commissionAmount: {
      type: Number,
      default: 0,
    },
    providerPayoutAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate commission and payouts before storing the payment details
paymentSchema.pre('save', function (next) {
  this.commissionAmount = this.amount * this.commissionRate;
  this.providerPayoutAmount = this.amount - this.commissionAmount;
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
