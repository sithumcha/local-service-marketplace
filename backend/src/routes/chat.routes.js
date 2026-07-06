import express from 'express';
import {
  getMyChats,
  getMessagesByBookingId,
  sendMessage,
} from '../controllers/chat.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect); // Secure all chat routes

router.get('/', getMyChats);
router.get('/:bookingId/messages', getMessagesByBookingId);
router.post('/:chatId/messages', sendMessage);

export default router;
