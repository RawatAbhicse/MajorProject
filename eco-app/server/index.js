import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import trekRoutes from './routes/treks.js';
import guideRoutes from './routes/guides.js';
import weatherRoutes from './routes/weather.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import friendRoutes from './routes/friends.js';
import chatRoutes from './routes/chat.js';
import bookingRoutes from './routes/bookings.js';
import auth from './middleware/auth.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static images
app.use('/images', express.static('public/images'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Trekking App API!' });
});
app.use('/api/treks', trekRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/weather',auth, weatherRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/friends', auth, friendRoutes);
app.use('/api/chat', chatRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});