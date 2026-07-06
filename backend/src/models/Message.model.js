import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        type: String, // URLs of images or files
      },
    ],
    seen: {
      type: Boolean,
      default: false,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'audio'],
      default: 'text',
    },
    audioContent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
