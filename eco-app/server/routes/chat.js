import express from 'express';
import axios from 'axios';

const router = express.Router();

function detectIntent(message) {
  const msg = message.toLowerCase();
  if (msg.includes("near") || msg.includes("nearby")) return "nearby";
  if (msg.includes("plan") || msg.includes("itinerary")) return "plan";
  if (msg.includes("food") || msg.includes("restaurant")) return "food";
  return "general";
}

async function getNearbyPlaces(lat, lng) {
  // Replace with Google Places API later
  return [
    { name: "Robber's Cave", distance: "6 km" },
    { name: "Sahastradhara", distance: "14 km" },
  ];
}

async function getAIResponse(message) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }

  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a travel assistant for India.\nGive helpful, short, practical travel advice.\n\nInclude:\n- places\n- time required\n- tips\n- budget suggestions\n`,
        },
        { role: "user", content: message },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.choices[0].message.content;
}

router.post('/', async (req, res) => {
  try {
    const { message, location } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required and must be a non-empty string." });
    }

    const intent = detectIntent(message);

    if (intent === "nearby" && location) {
      const places = await getNearbyPlaces(location.lat, location.lng);
      return res.json({
        reply: `Here are some places nearby:\n\n${places
          .map((p) => `• ${p.name} (${p.distance})`)
          .join("\n")}`,
      });
    }

    const aiReply = await getAIResponse(message);
    res.json({ reply: aiReply });
  } catch (err) {
    console.error("Chat route error:", err.message || err);

    // Distinguish OpenAI API errors
    if (err.response && err.response.status) {
      const status = err.response.status;
      if (status === 401) {
        return res.status(500).json({ error: "OpenAI API key is invalid or expired. Please check server configuration." });
      }
      if (status === 429) {
        return res.status(500).json({ error: "OpenAI rate limit exceeded. Please try again later." });
      }
      return res.status(500).json({ error: `OpenAI API error (${status}): ${err.response.data?.error?.message || "Unknown error"}` });
    }

    // Handle missing API key or other server errors
    if (err.message && err.message.includes("OPENAI_API_KEY")) {
      return res.status(500).json({ error: err.message });
    }

    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
});

export default router;
import express from 'express';
import auth from '../middleware/auth.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Guide from '../models/Guide.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for audio uploads
const audioDir = 'uploads/audio';
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Get all chats for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [
        { userId: req.user._id },
        { guideId: req.user._id }
      ],
      status: 'active'
    })
      .populate('userId', 'username fullName')
      .populate('guideId', 'name specialties')
      .populate('trekId', 'name')
      .sort({ lastMessageTime: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific chat by ID
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('userId', 'username fullName')
      .populate('guideId', 'name specialties');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check authorization
    if (chat.userId._id.toString() !== req.user._id.toString() &&
        chat.guideId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Mark messages as read
    chat.messages.forEach(msg => {
      if (msg.senderId.toString() !== req.user._id.toString()) {
        msg.isRead = true;
      }
    });
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or get chat between user and guide
router.post('/get-or-create/:guideId', auth, async (req, res) => {
  try {
    const { trekId } = req.body;

    let chat = await Chat.findOne({
      userId: req.user._id,
      guideId: req.params.guideId
    });

    if (!chat) {
      const user = await User.findById(req.user._id);
      const guide = await Guide.findById(req.params.guideId);

      if (!user || !guide) {
        return res.status(404).json({ error: 'User or Guide not found' });
      }

      chat = new Chat({
        userId: req.user._id,
        guideId: req.params.guideId,
        trekId: trekId || null,
        messages: [],
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: 0
      });

      await chat.save();
    }

    const populatedChat = await chat.populate([
      { path: 'userId', select: 'username fullName' },
      { path: 'guideId', select: 'name specialties' },
      { path: 'trekId', select: 'name' }
    ]);

    res.json(populatedChat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send text message
router.post('/:chatId/message', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const user = await User.findById(req.user._id);

    const message = {
      senderId: req.user._id,
      senderName: user.fullName || user.username,
      senderType: chat.userId.toString() === req.user._id.toString() ? 'user' : 'guide',
      content: content.trim(),
      messageType: 'text',
      timestamp: new Date(),
      isRead: false
    };

    chat.messages.push(message);
    chat.lastMessage = content.substring(0, 50);
    chat.lastMessageTime = new Date();
    chat.unreadCount += 1;

    await chat.save();

    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send audio message
router.post('/:chatId/audio', upload.single('audio'), auth, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { duration, waveform } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const user = await User.findById(req.user._id);
    const audioUrl = `/api/chats/audio/${req.file.filename}`;

    const message = {
      senderId: req.user._id,
      senderName: user.fullName || user.username,
      senderType: chat.userId.toString() === req.user._id.toString() ? 'user' : 'guide',
      audioUrl: audioUrl,
      audioWaveform: waveform ? JSON.parse(waveform) : null,
      duration: duration ? parseInt(duration) : null,
      messageType: 'audio',
      timestamp: new Date(),
      isRead: false
    };

    chat.messages.push(message);
    chat.lastMessage = `🎙️ Audio message (${duration}s)`;
    chat.lastMessageTime = new Date();
    chat.unreadCount += 1;

    await chat.save();

    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get audio file
router.get('/audio/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(audioDir, filename);

    // Security check to prevent directory traversal
    if (!filepath.startsWith(path.resolve(audioDir))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.download(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete chat
router.delete('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check authorization
    if (chat.userId.toString() !== req.user._id.toString() && 
        chat.guideId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    chat.status = 'archived';
    await chat.save();

    res.json({ success: true, message: 'Chat archived' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.put('/:chatId/read', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    chat.messages.forEach(msg => {
      if (msg.senderId.toString() !== req.user._id.toString()) {
        msg.isRead = true;
      }
    });

    chat.unreadCount = 0;
    await chat.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
