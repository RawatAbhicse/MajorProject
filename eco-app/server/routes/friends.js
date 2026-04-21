import { Router } from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';

const router = Router();

// Send friend request
router.post('/request', auth, async (req, res) => {
  try {
    const { toUserId } = req.body;
    if (!toUserId) return res.status(400).json({ error: 'toUserId required' });

    const toUser = await User.findById(toUserId);
    if (!toUser) return res.status(404).json({ error: 'User not found' });

    if (toUserId === req.user.id) return res.status(400).json({ error: 'Cannot send request to yourself' });

    // Check if already friends
    if (req.user.friends.includes(toUserId)) return res.status(400).json({ error: 'Already friends' });

    // Check if request already exists
    const existing = await FriendRequest.findOne({
      $or: [
        { fromUser: req.user.id, toUser: toUserId },
        { fromUser: toUserId, toUser: req.user.id }
      ]
    });
    if (existing) return res.status(400).json({ error: 'Request already exists' });

    const request = new FriendRequest({ fromUser: req.user.id, toUser: toUserId });
    await request.save();
    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept friend request
router.put('/accept/:id', auth, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.toUser.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    if (request.status !== 'pending') return res.status(400).json({ error: 'Request not pending' });

    request.status = 'accepted';
    await request.save();

    // Add to friends lists
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { friends: request.fromUser } });
    await User.findByIdAndUpdate(request.fromUser, { $addToSet: { friends: req.user.id } });

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decline friend request
router.put('/decline/:id', auth, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.toUser.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    request.status = 'declined';
    await request.save();

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get friends list
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'username fullName');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending requests (sent to me)
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await FriendRequest.find({ toUser: req.user.id, status: 'pending' })
      .populate('fromUser', 'username fullName');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;