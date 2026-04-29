import express from 'express';
import axios from 'axios';
const router = express.Router();

async function getAIResponse(message, apiKey, location) {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 8000);

  const system =
    'You are a fast, helpful travel assistant for Uttarakhand (India) trekking. ' +
    'Give concise, practical advice and include safety notes when relevant.';

  const user = location
    ? `User location context: ${location}\n\nUser message: ${message}`
    : message;

  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
      max_tokens: 220,
    },
    {
      timeout: timeoutMs,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const content = data?.choices?.[0]?.message?.content;
  return typeof content === 'string' && content.trim() ? content.trim() : null;
}


// AI Chat endpoint for travel assistant (public - no auth needed)
router.post('/', async (req, res) => {
  try {
    const { message, location } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Mock location response if needed
    let reply = `Thanks for asking about "${message}"! I'm your travel assistant. Ask me about Uttarakhand treks, guides, weather, or planning tips.`;

    // Simple intent-based responses (extend as needed)
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('roopkund')) {
      reply = 'Roopkund Trek: 9 days moderate trek in Uttarakhand. Best May-Jun/Sept-Oct. Budget ₹25k-35k. Famous for mystery skeleton lake at 16k ft.';
    } else if (lowerMsg.includes('guide') || lowerMsg.includes('local')) {
      reply = 'Local guides available in Lohajung, Wan, Bedini Bugyal. Rates ₹2k-3k/day. Book via our Guides page or trusted platforms.';
    } else if (lowerMsg.includes('weather')) {
      reply = 'Check WeatherWidget on homepage for real-time updates. Best season May-Jun/Sept-Oct. Always carry rain gear.';
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const aiReply = await getAIResponse(message, apiKey, location);
      if (aiReply) reply = aiReply;
    }

    res.json({ reply });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: 'Sorry, something went wrong. Try again!' });
  }
});

export default router;

