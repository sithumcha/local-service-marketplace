import express from 'express';
import {
  upsertProviderProfile,
  getMyProviderProfile,
  getProviderById,
  getProviders,
  sandboxApproveMyProfile,
  submitKyc,
  buyFeaturedSubscription,
  updateBusySlots,
} from '../controllers/provider.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public route to search nearby providers
router.get('/', getProviders);

// Provider profile creation/updating
router.post('/profile', protect, authorize('provider'), upsertProviderProfile);
router.post('/profile/sandbox-approve', protect, authorize('provider'), sandboxApproveMyProfile);
router.post('/profile/kyc', protect, authorize('provider'), submitKyc);
router.post('/profile/feature', protect, authorize('provider'), buyFeaturedSubscription);
router.post('/profile/busy-slots', protect, authorize('provider'), updateBusySlots);

router.get('/profile/me', protect, authorize('provider'), getMyProviderProfile);

// Public route to view provider details
router.get('/:id', getProviderById);

export default router;

