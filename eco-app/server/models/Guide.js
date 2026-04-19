import { Schema, model } from 'mongoose';

const guideSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, default: '/api/placeholder/100/100' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  experience: { type: Number, required: true },
  location: { type: String, required: true },
  specialties: { type: [String], default: [] },
  languages: { type: [String], default: [] },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  availability: { type: String, default: 'Available' },
  totalTrips: { type: Number, default: 0 },
  certifications: { type: [String], default: [] },
}, { timestamps: true });

export default model('Guide', guideSchema);