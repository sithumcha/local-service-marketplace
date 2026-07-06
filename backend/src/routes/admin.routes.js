import express from 'express';
import {
  getDashboardStats,
  approveProvider,
  resolveDispute,
  deleteUser,
  deleteProviderProfile,
  revokeProviderApproval,
  getKycQueue,
  verifyProvider,
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Secure all admin routes

router.get('/stats', getDashboardStats);
router.get('/kyc-queue', getKycQueue);
router.post('/users/:userId/verify', verifyProvider);
router.post('/providers/:profileId/approve', approveProvider);
router.post('/providers/:profileId/revoke', revokeProviderApproval);
router.delete('/providers/:profileId', deleteProviderProfile);
router.delete('/users/:userId', deleteUser);
router.post('/bookings/:bookingId/resolve-dispute', resolveDispute);

export default router;

