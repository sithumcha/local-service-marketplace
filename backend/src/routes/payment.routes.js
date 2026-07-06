import express from 'express';
import {
  createIntent,
  releaseHeldPayment,
  getMyPaymentHistory,
} from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect); // Secure all payment routes

router.post('/create-intent', createIntent);
router.post('/release/:bookingId', releaseHeldPayment);
router.get('/history', getMyPaymentHistory);

export default router;
