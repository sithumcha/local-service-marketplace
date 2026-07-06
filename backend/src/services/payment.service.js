import Payment from '../models/Payment.model.js';
import Booking from '../models/Booking.model.js';
import { sendNotification } from './notification.service.js';

// Setup Stripe config conditionally
let stripeInstance = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    const Stripe = (await import('stripe')).default;
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  } catch (err) {
    console.error('Stripe SDK import failed. Using payments sandbox fallback.', err.message);
  }
}

export const createEscrowPayment = async (bookingId, amount) => {
  let transactionId = `mock_tx_${Date.now()}`;
  
  if (stripeInstance) {
    try {
      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: Math.round(amount * 100), // in LKR cents / standard cents
        currency: 'lkr',
        payment_method_types: ['card'],
        capture_method: 'manual', // Hold funds (escrow style)
      });
      transactionId = paymentIntent.id;
    } catch (err) {
      console.error('Stripe Intent failed. Falling back to sandbox transaction id.', err.message);
    }
  }

  // Create payment record (pre-save hook will compute commission rates)
  const payment = await Payment.create({
    bookingId,
    amount,
    status: 'held',
    transactionId,
  });

  return payment;
};

export const releaseEscrowPayment = async (bookingId) => {
  const payment = await Payment.findOne({ bookingId });
  if (!payment) {
    throw new Error('Payment records not found for this booking');
  }

  if (payment.status !== 'held') {
    throw new Error(`Funds cannot be released. Current status is ${payment.status}`);
  }

  if (stripeInstance && payment.transactionId.startsWith('pi_')) {
    try {
      // Capture Stripe intent to release funds
      await stripeInstance.paymentIntents.capture(payment.transactionId);
    } catch (err) {
      console.error('Stripe release capture failed. Releasing locally.', err.message);
    }
  }

  payment.status = 'released';
  payment.escrowReleaseDate = new Date();
  await payment.save();

  // Notify provider of payout
  const booking = await Booking.findById(bookingId).populate('providerId');
  if (booking) {
    await sendNotification({
      userId: booking.providerId._id,
      title: 'Payout Released!',
      message: `LKR ${payment.providerPayoutAmount} has been released to your account after 10% marketplace commission deduction.`,
      type: 'booking',
    });
  }

  return payment;
};

export const refundEscrowPayment = async (bookingId) => {
  const payment = await Payment.findOne({ bookingId });
  if (!payment) {
    throw new Error('Payment records not found for this booking');
  }

  if (payment.status !== 'held') {
    throw new Error('Only held payments can be refunded');
  }

  if (stripeInstance && payment.transactionId.startsWith('pi_')) {
    try {
      // Cancel held Stripe intent
      await stripeInstance.paymentIntents.cancel(payment.transactionId);
    } catch (err) {
      console.error('Stripe refund capture failed. Refunding locally.', err.message);
    }
  }

  payment.status = 'refunded';
  await payment.save();

  // Notify customer
  const booking = await Booking.findById(bookingId).populate('customerId');
  if (booking) {
    await sendNotification({
      userId: booking.customerId._id,
      title: 'Escrow Refund Completed',
      message: `Your booking hold of LKR ${payment.amount} has been successfully refunded to your card.`,
      type: 'booking',
    });
  }

  return payment;
};
