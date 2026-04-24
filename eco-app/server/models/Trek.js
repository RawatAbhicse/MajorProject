import mongoose from 'mongoose';

const trekReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const trekSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  duration: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'moderate', 'hard'], required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  reviews: { type: [trekReviewSchema], default: [] },
  maxGroupSize: { type: Number, required: true },
  description: { type: String, required: true },
  isEcoFriendly: { type: Boolean, default: true },
  season: { type: String, enum: ['spring', 'summer', 'autumn', 'winter'], required: true },
  popularity: { type: Number, default: 0 },
  image: { type: String, default: '/api/placeholder/400/250' },
}, { timestamps: true });

export default mongoose.model('Trek', trekSchema);
