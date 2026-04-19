import express from 'express';
import Trek from '../models/Trek.js';

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