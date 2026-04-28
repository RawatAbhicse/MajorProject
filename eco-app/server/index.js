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
// Stream audio files with proper Range request support (before auth middleware)
app.get('/api/chats/audio/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filepath = path.join(__dirname, 'uploads/audio', filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const stat = fs.statSync(filepath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      return res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
    }

    const clampedEnd = Math.min(end, fileSize - 1);
    res.status(206).set({
      'Content-Range': `bytes ${start}-${clampedEnd}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': clampedEnd - start + 1,
      'Content-Type': 'audio/webm',
    });
    fs.createReadStream(filepath, { start, end: clampedEnd }).pipe(res);
  } else {
    res.set({
      'Content-Length': fileSize,
      'Content-Type': 'audio/webm',
      'Accept-Ranges': 'bytes',
    });
    fs.createReadStream(filepath).pipe(res);
  }
});

app.use('/api/chats', auth, chatRoutes);
app.use('/api/bookings', auth, bookingRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});