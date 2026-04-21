import { Router } from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

// Get current user profile
router.get('/me', auth, async (req, res) => {
  const user = req.user;
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    location: user.location,
    bio: user.bio,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

// Update current user profile
router.put('/me', auth, async (req, res) => {
  try {
    const allowed = ['fullName', 'phone', 'location', 'bio', 'email'];
    for (const key of allowed) {
      if (key in req.body) {
        req.user[key] = req.body[key];
      }
    }
    await req.user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id, $nin: req.user.friends } },
        { $or: [
          { username: new RegExp(q, 'i') },
          { fullName: new RegExp(q, 'i') }
        ]}
      ]
    }).select('username fullName _id').limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
