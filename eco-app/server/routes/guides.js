import express from 'express';
import Guide from '../models/Guide.js';
import auth from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_jwt_secret_key';

// Optional auth — attaches req.user if a valid token is present, never blocks
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.id;
    }
  } catch (_) { /* invalid/expired token — just skip */ }
  next();
};

// Validation helper function
const validateGuideData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }
  if (!data.email || data.email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  if (!data.phone || data.phone.trim().length === 0) {
    errors.push('Phone is required');
  } else if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Phone must be 10 digits');
  }
  if (!data.location || data.location.trim().length === 0) {
    errors.push('Location is required');
  }
  if (!data.experience || data.experience < 1) {
    errors.push('Experience must be at least 1 year');
  }
  if (!data.pricePerDay || data.pricePerDay < 0) {
    errors.push('Price per day is required and must be non-negative');
  }
  if (!data.specialties || !Array.isArray(data.specialties) || data.specialties.length === 0) {
    errors.push('At least one specialty is required');
  }
  if (!data.languages || !Array.isArray(data.languages) || data.languages.length === 0) {
    errors.push('At least one language is required');
  }

  return errors;
};

// Get all guides (public endpoint) - only active guides
router.get('/', async (req, res) => {
  try {
    const guides = await Guide.find({ isActive: { $ne: false } });
    res.json(guides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single guide by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) return res.status(404).json({ error: 'Guide not found' });

    // Inactive guides are only visible to their owner
    const isOwner = req.userId && guide.userId && String(req.userId) === String(guide.userId);
    if (!guide.isActive && !isOwner) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    res.json(guide);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register as a guide (Create a guide)
router.post('/', auth, async (req, res) => {
  try {
    // Parse data if it comes as strings
    const data = {
      ...req.body,
      userId: req.user._id,
      experience: parseInt(req.body.experience),
      pricePerDay: parseInt(req.body.pricePerDay),
      specialties: typeof req.body.specialties === 'string' ? JSON.parse(req.body.specialties) : req.body.specialties,
      languages: typeof req.body.languages === 'string' ? JSON.parse(req.body.languages) : req.body.languages,
      certifications: typeof req.body.certifications === 'string' ? JSON.parse(req.body.certifications) : req.body.certifications || [],
      isActive: true,
    };

    // Validate guide data
    const validationErrors = validateGuideData(data);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join('; ') });
    }

    // Check if guide with same email already exists (and is active)
    const existingGuide = await Guide.findOne({ email: data.email, isActive: true });
    if (existingGuide) {
      return res.status(400).json({ error: 'A guide with this email already exists' });
    }

    // Create new guide
    const guide = new Guide(data);
    await guide.save();
    
    res.status(201).json({
      message: 'Guide registered successfully!',
      guide: guide,
    });
  } catch (err) {
    console.error('Guide registration error:', err);
    res.status(400).json({ error: err.message || 'Failed to register guide' });
  }
});

// Update a guide
router.put('/:id', auth, async (req, res) => {
  try {
    // Parse data if it comes as strings
    const data = { ...req.body };
    if (data.specialties && typeof data.specialties === 'string') {
      data.specialties = JSON.parse(data.specialties);
    }
    if (data.languages && typeof data.languages === 'string') {
      data.languages = JSON.parse(data.languages);
    }
    if (data.certifications && typeof data.certifications === 'string') {
      data.certifications = JSON.parse(data.certifications);
    }

    const guide = await Guide.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    res.json(guide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a guide (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    
    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    // Check if the user is the owner of this guide
    if (!guide.userId || String(guide.userId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'You can only delete your own guide profile' });
    }

    // Soft delete: mark as inactive
    guide.isActive = false;
    guide.deletedAt = new Date();
    await guide.save();

    res.json({ 
      message: 'Guide profile deleted successfully',
      guide: guide 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restore a guide (undo soft delete)
router.post('/:id/restore', auth, async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    
    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    // Check if the user is the owner of this guide
    if (!guide.userId || String(guide.userId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'You can only restore your own guide profile' });
    }

    // Restore the guide
    guide.isActive = true;
    guide.deletedAt = null;
    await guide.save();

    res.json({ 
      message: 'Guide profile restored successfully',
      guide: guide 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;