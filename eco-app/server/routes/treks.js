import express from 'express';
import Trek from '../models/Trek.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all treks
router.get('/', async (req, res) => {
  try {
    const treks = await Trek.find();
    res.json(treks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); 

// Get a single trek by ID
router.get('/:id', async (req, res) => {
  try {
    const trek = await Trek.findById(req.params.id);
    if (!trek) return res.status(404).json({ error: 'Trek not found' });
    res.json(trek);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reviews for a trek (public)
router.get('/:id/reviews', async (req, res) => {
  try {
    const trek = await Trek.findById(req.params.id).select('reviews rating reviewCount');
    if (!trek) return res.status(404).json({ error: 'Trek not found' });

    const reviews = [...(trek.reviews || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ reviews, rating: trek.rating, reviewCount: trek.reviewCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a review to a trek (auth required)
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body || {};
    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const text = (comment || '').toString().trim();
    if (text.length > 1000) {
      return res.status(400).json({ error: 'Comment is too long (max 1000 chars)' });
    }

    const trek = await Trek.findById(req.params.id);
    if (!trek) return res.status(404).json({ error: 'Trek not found' });

    const userId = req.user._id.toString();
    const already = (trek.reviews || []).some(r => r.user?.toString() === userId);
    if (already) {
      return res.status(400).json({ error: 'You have already reviewed this trek' });
    }

    trek.reviews.push({
      user: req.user._id,
      username: req.user.username || req.user.fullName || 'User',
      rating: parsedRating,
      comment: text,
    });

    const count = trek.reviews.length;
    const avg = trek.reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / (count || 1);
    trek.reviewCount = count;
    trek.rating = Math.round(avg * 10) / 10;

    await trek.save();

    res.status(201).json({ success: true, rating: trek.rating, reviewCount: trek.reviewCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a trek
router.post('/', async (req, res) => {
  try {
    const trek = new Trek(req.body);
    await trek.save();
    res.status(201).json(trek);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a trek
router.put('/:id', async (req, res) => {
  try {
    const trek = await Trek.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!trek) return res.status(404).json({ error: 'Trek not found' });
    res.json(trek);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a trek
router.delete('/:id', async (req, res) => {
  try {
    const trek = await Trek.findByIdAndDelete(req.params.id);
    if (!trek) return res.status(404).json({ error: 'Trek not found' });
    res.json({ message: 'Trek deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
