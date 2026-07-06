import express from 'express';
import {
  upsertProviderProfile,
  getMyProviderProfile,
  getProviderById,
  getProviders,
  sandboxApproveMyProfile,
} from '../controllers/provider.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public route to search nearby providers
router.get('/', getProviders);

// Provider profile creation/updating
router.post('/profile', protect, authorize('provider'), upsertProviderProfile);
router.post('/profile/sandbox-approve', protect, authorize('provider'), sandboxApproveMyProfile);

router.get('/profile/me', protect, authorize('provider'), getMyProviderProfile);

// Public route to view provider details
router.get('/:id', getProviderById);

export default router;

