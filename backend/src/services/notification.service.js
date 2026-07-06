import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import sendEmail from '../utils/sendEmail.js';

export const sendNotification = async ({ userId, title, message, type = 'system' }) => {
  try {
    // 1. Persist notification in database
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
    });

    // 2. Dispatch a notification email alert
    const user = await User.findById(userId);
    if (user && user.email) {
      await sendEmail({
        email: user.email,
        subject: `QuickServe.lk: ${title}`,
        message: `${message}\n\nThank you,\nThe QuickServe Team.`,
      });
    }

    // 3. Dispatch a real-time socket notification alert
    try {
      const { getIO } = await import('../config/socket.js');
      getIO().to(userId.toString()).emit('notification_received', notification);
    } catch (socketError) {
      console.log('Realtime socket notification trigger failed:', socketError.message);
    }


    return notification;
  } catch (error) {
    console.error('Error dispatching notification:', error.message);
  }
};

