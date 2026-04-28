import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  trekId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Trek',  required: true },
  guideId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: true },
  chatId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Chat',  default: null },

  date:            { type: Date,   required: true },
  groupSize:       { type: Number, required: true, min: 1 },
  specialRequests: { type: String, default: '' },

  trekAmount:  { type: Number, required: true },
  guideAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
    default: 'pending',
  },

  payment: {
    razorpayOrderId:   { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'captured', 'failed'],
      default: 'pending',
    },
  },
}, { timestamps: true });

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ 'payment.razorpayOrderId': 1 });

export default mongoose.model('Booking', bookingSchema);
