import express from 'express';
import { getServices, createService, deleteService } from '../controllers/service.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getServices);
router.post('/', protect, authorize('admin'), createService);
router.delete('/:id', protect, authorize('admin'), deleteService);

export default router;
