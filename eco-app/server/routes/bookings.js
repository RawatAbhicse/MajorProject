import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import auth from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Trek from '../models/Trek.js';
import Guide from '../models/Guide.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

const router = express.Router();

const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

// POST /api/bookings/create-order
// Creates a Razorpay order and returns the order details to the client.
router.post('/create-order', auth, async (req, res) => {
  try {
    const { trekId, guideId, date, groupSize, specialRequests } = req.body;

    if (!trekId || !guideId || !date || !groupSize) {
      return res.status(400).json({ error: 'trekId, guideId, date and groupSize are required' });
    }
    if (parseInt(groupSize) < 1) {
      return res.status(400).json({ error: 'groupSize must be at least 1' });
    }

    const [trek, guide] = await Promise.all([
      Trek.findById(trekId),
      Guide.findById(guideId),
    ]);

    if (!trek)  return res.status(404).json({ error: 'Trek not found' });
    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    if (!guide.isActive) return res.status(400).json({ error: 'Guide is not available' });

    const size        = parseInt(groupSize);
    const trekAmount  = trek.price * size;
    const guideAmount = guide.pricePerDay * trek.duration;
    const totalAmount = trekAmount + guideAmount;

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount:   Math.round(totalAmount * 100), // paise
      currency: 'INR',
      receipt:  `booking_${Date.now()}`,
      notes: {
        trekId:    trekId.toString(),
        guideId:   guideId.toString(),
        userId:    req.user._id.toString(),
        groupSize: size.toString(),
      },
    });

    res.json({
      orderId:     order.id,
      amount:      totalAmount,
      trekAmount,
      guideAmount,
      currency:    'INR',
      keyId:       process.env.RAZORPAY_KEY_ID,
      trek: {
        name:     trek.name,
        location: trek.location,
        duration: trek.duration,
        image:    trek.image,
      },
      guide: { name: guide.name },
    });
  } catch (err) {
    console.error('create-order error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings/verify-payment
// Verifies the Razorpay signature, persists the booking, and auto-creates a chat.
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const {
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
      trekId, guideId, date, groupSize, specialRequests,
      trekAmount, guideAmount, totalAmount,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    // Verify HMAC signature
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expected !== razorpaySignature) {
      return res.status(400).json({ error: 'Payment verification failed: signature mismatch' });
    }

    // Guard against duplicate payments
    const existing = await Booking.findOne({ 'payment.razorpayPaymentId': razorpayPaymentId });
    if (existing) {
      return res.json({ success: true, bookingId: existing._id, chatId: existing.chatId });
    }

    const [trek, guide] = await Promise.all([
      Trek.findById(trekId),
      Guide.findById(guideId),
    ]);

    if (!trek || !guide) {
      return res.status(404).json({ error: 'Trek or Guide not found' });
    }

    // Create booking record
    const booking = await Booking.create({
      userId:   req.user._id,
      trekId,
      guideId,
      date:     new Date(date),
      groupSize: parseInt(groupSize),
      specialRequests: specialRequests || '',
      trekAmount:  Number(trekAmount),
      guideAmount: Number(guideAmount),
      totalAmount: Number(totalAmount),
      status: 'confirmed',
      payment: {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        status: 'captured',
      },
    });

    // Create or reuse chat and send an automated welcome message from the guide
    let chat = await Chat.findOne({ userId: req.user._id, guideId });
    if (!chat) {
      chat = new Chat({ userId: req.user._id, guideId, trekId, messages: [] });
    }

    const trekDate = new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    const welcomeContent =
      `Hello! I'm ${guide.name}, your guide for the ${trek.name} trek on ${trekDate}. ` +
      `Your booking is confirmed! I'm thrilled to guide you through this beautiful journey. ` +
      `Please feel free to ask me anything about the route, equipment, or preparation. ` +
      `See you soon! 🏔️`;

    chat.messages.push({
      senderId:    guideId,       // guide._id used as senderId (senderType marks it as guide)
      senderName:  guide.name,
      senderType:  'guide',
      content:     welcomeContent,
      messageType: 'text',
      timestamp:   new Date(),
      isRead:      false,
    });
    chat.lastMessage     = welcomeContent.substring(0, 80) + '…';
    chat.lastMessageTime = new Date();
    chat.unreadCount     = (chat.unreadCount || 0) + 1;

    await chat.save();

    booking.chatId = chat._id;
    await booking.save();

    res.json({ success: true, bookingId: booking._id, chatId: chat._id });
  } catch (err) {
    console.error('verify-payment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings  — all bookings for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('trekId',  'name location duration image difficulty')
      .populate('guideId', 'name image specialties pricePerDay rating')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/:id  — single booking detail
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('trekId',  'name location duration image difficulty season price description')
      .populate('guideId', 'name image specialties languages pricePerDay phone email certifications rating experience')
      .populate('userId',  'fullName email phone username');

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
