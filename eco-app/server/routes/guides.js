import express from 'express';
import Guide from '../models/Guide.js';

const router = express.Router();

// Get all guides
router.get('/', async (req, res) => {
  try {
    const guides = await Guide.find();
    res.json(guides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single guide by ID
router.get('/:id', async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    res.json(guide);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a guide
router.post('/', async (req, res) => {
  try {
    const guide = new Guide(req.body);
    await guide.save();
    res.status(201).json(guide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a guide
router.put('/:id', async (req, res) => {
  try {
    const guide = await Guide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    res.json(guide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a guide
router.delete('/:id', async (req, res) => {
  try {
    const guide = await Guide.findByIdAndDelete(req.params.id);
    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    res.json({ message: 'Guide deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;