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
import authMiddleware from './middleware/auth.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('public/images'));

// MongoDB Connection (clean - no deprecated options)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Trekking App API!' });
});

app.use('/api/treks', trekRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/weather', authMiddleware, weatherRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/friends', authMiddleware, friendRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bookings', authMiddleware, bookingRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    console.log('Server closed');
  });
});
