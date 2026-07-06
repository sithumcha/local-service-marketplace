import Chat from '../models/Chat.model.js';
import Message from '../models/Message.model.js';

// @desc    Get user conversations list
// @route   GET /api/chat
// @access  Private
export const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
    })
      .populate('participants', 'name email profileImage role')
      .populate({
        path: 'bookingId',
        populate: { path: 'serviceId', select: 'name' },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get conversation history / messages
// @route   GET /api/chat/:bookingId/messages
// @access  Private
export const getMessagesByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find chat room linked to booking
    const chat = await Chat.findOne({
      bookingId,
      participants: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat conversation not found' });
    }

    const messages = await Message.find({ chatId: chat._id })
      .populate('senderId', 'name profileImage')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      chat,
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post a message in a conversation channel
// @route   POST /api/chat/:chatId/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text, attachments } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat channel not found' });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You are not a participant in this conversation' });
    }

    const message = await Message.create({
      chatId,
      senderId: req.user.id,
      text,
      attachments: attachments || [],
    });

    // Populate sender details before responding
    await message.populate('senderId', 'name profileImage');

    res.status(211).json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
