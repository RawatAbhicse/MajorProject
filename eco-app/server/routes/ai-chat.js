import express from 'express';
const router = express.Router();


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

    // TODO: Integrate real AI with OpenAI key in .env
    // const apiKey = process.env.OPENAI_API_KEY;
    // if (apiKey) {
    //   reply = await getAIResponse(message, apiKey);
    // }

    res.json({ reply });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: 'Sorry, something went wrong. Try again!' });
  }
});

export default router;

