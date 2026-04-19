import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String },
  phone: { type: String },
  location: { type: String },
  bio: { type: String },
}, { timestamps: true });

export default mongoose.model('User', userSchema);