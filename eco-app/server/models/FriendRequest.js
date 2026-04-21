import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
}, { timestamps: true });

// Ensure no duplicate requests between same users
friendRequestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

export default mongoose.model('FriendRequest', friendRequestSchema);