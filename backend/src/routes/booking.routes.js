import express from 'express';
import {
  createBooking,
  payBooking,
  updateBookingStatus,
  getUserBookings,
  getBookingDetails,
  deleteBooking,
} from '../controllers/booking.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect); // Secure all booking routes

router.post('/', createBooking);
router.post('/:id/pay', payBooking);
router.patch('/:id/status', updateBookingStatus);
router.delete('/:id', deleteBooking);

router.get('/user/:userId', getUserBookings);
router.get('/:id', getBookingDetails);

export default router;

