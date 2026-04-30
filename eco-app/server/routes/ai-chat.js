import express from 'express';
import axios from 'axios';

const router = express.Router();

const DEFAULT_SYSTEM_PROMPT =
  'You are a fast, helpful travel assistant for Uttarakhand (India). ' +
  'Give concise, practical advice and include safety notes when relevant.';

function buildUserPrompt(message, location) {
  return location
    ? `User location context: ${JSON.stringify(location)}\n\nUser message: ${message}`
    : message;
}

async function getOpenAIResponse(message, apiKey, location) {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 8000);
  const system = process.env.AI_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT;
  const user = buildUserPrompt(message, location);

  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
      max_tokens: 240,
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

async function getGeminiResponse(message, apiKey, location) {
  // Note: Some older model ids (e.g. gemini-1.5-flash) may not be available for all keys/projects.
  // Use a current "latest" model by default.
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || 12000);
  const system = process.env.AI_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT;
  const user = buildUserPrompt(message, location);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const { data } = await axios.post(
    url,
    {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 240,
      },
    },
    {
      timeout: timeoutMs,
      params: { key: apiKey },
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p?.text)
    .filter(Boolean)
    .join('');
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

async function getAIResponse(message, location) {
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (provider === 'gemini') {
    if (!geminiKey) return null;
    return getGeminiResponse(message, geminiKey, location);
  }

  if (provider === 'openai') {
    if (!openaiKey) return null;
    return getOpenAIResponse(message, openaiKey, location);
  }

  // Auto-pick: prefer Gemini if configured, else OpenAI
  if (geminiKey) return getGeminiResponse(message, geminiKey, location);
  if (openaiKey) return getOpenAIResponse(message, openaiKey, location);

  return null;
}

function getFallbackReply(message) {
  const lowerMsg = message.toLowerCase();

  if (
    lowerMsg.includes('how are you') ||
    lowerMsg === 'hi' ||
    lowerMsg === 'h' ||
    lowerMsg === 'hello'
  ) {
    return "I'm good — tell me what you're planning (Rishikesh/Haridwar/Auli/Valleys etc.) and your dates.";
  }

  if (
    lowerMsg.includes('rishikesh') &&
    (lowerMsg.includes('tourist') || lowerMsg.includes('places') || lowerMsg.includes('near'))
  ) {
    return (
      'Top places near Rishikesh:\n' +
      '- Laxman Jhula / Ram Jhula + Ganga aarti at Triveni Ghat\n' +
      '- Neer Garh Waterfall (short hike)\n' +
      '- Beatles Ashram (Chaurasi Kutia)\n' +
      '- Shivpuri (rafting/camping, season-dependent)\n' +
      '- Kunjapuri Temple sunrise (viewpoint)\n' +
      '- Vashishta Gufa (quiet cave by the river)\n' +
      '- Rajaji National Park (safari, check timings)\n' +
      'Share your budget + how many hours/days, and I will suggest an itinerary.'
    );
  }

  if (lowerMsg.includes('weather')) {
    return 'Tell me the place (e.g., Rishikesh / Chopta / Auli) and your dates — weather changes fast in the hills, and I can suggest what to pack + backup plans.';
  }

  if (lowerMsg.includes('guide') || lowerMsg.includes('local')) {
    return 'For guides: share the trek name + group size + dates. I can suggest what to ask, typical inclusions (food/gear), and safety checks before booking.';
  }

  return (
    'I can help with Uttarakhand travel/trek planning. ' +
    'Ask about treks, routes, permits, weather, packing, budgets, or safety.'
  );
}

// AI Chat endpoint (public - no auth)
router.post('/', async (req, res) => {
  try {
    const { message, location } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    let reply = getFallbackReply(message);

    const hasAnyKey = Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
    if (!hasAnyKey) {
      return res.json({
        reply:
          `AI mode is not enabled on the server (missing GEMINI_API_KEY / OPENAI_API_KEY). ` +
          reply,
        aiUsed: false,
      });
    }

    try {
      const aiReply = await getAIResponse(message, location);
      return res.json({ reply: aiReply || reply, aiUsed: Boolean(aiReply) });
    } catch (error) {
      const status = error?.response?.status;
      const code = error?.code;
      const detail =
        error?.response?.data?.error?.message ||
        error?.response?.data?.error ||
        error?.message;

      console.error('AI Chat provider error:', { status, code, detail });

      return res.status(200).json({
        reply,
        aiUsed: false,
        aiError: status ? `ai_${status}` : code ? `ai_${code}` : 'ai_error',
      });
    }
  } catch (error) {
    console.error('AI Chat error:', error?.response?.data || error?.message || error);
    res.status(500).json({ error: 'Sorry, something went wrong. Try again!' });
  }
});

export default router;
