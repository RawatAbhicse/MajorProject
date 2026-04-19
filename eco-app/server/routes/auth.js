import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'your_secure_jwt_secret_key';

// Sign Up
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, phone, location, bio } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = new User({ username, email, passwordHash, fullName, phone, location, bio });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user: { username, email, fullName } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sign In
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role || 'user' }, jwtSecret, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;