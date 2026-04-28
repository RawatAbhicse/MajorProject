import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderType: {
    type: String,
    enum: ['user', 'guide'],
    required: true
  },
  content: {
    type: String,
    default: null
  },
  audioUrl: {
    type: String,
    default: null
  },
  audioWaveform: {
    type: [Number],
    default: null
  },
  duration: {
    type: Number,
    default: null
  },
  messageType: {
    type: String,
    enum: ['text', 'audio'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    required: true
  },
  trekId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trek',
    default: null
  },
  messages: [messageSchema],
  lastMessage: {
    type: String,
    default: null
  },
  lastMessageTime: {
    type: Date,
    default: null
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

chatSchema.index({ userId: 1, guideId: 1 }, { unique: true });
chatSchema.index({ createdAt: -1 });

export default mongoose.model('Chat', chatSchema);
