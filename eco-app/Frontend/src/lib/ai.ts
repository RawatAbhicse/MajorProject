export async function getAIResponse(
  message: string,
  apiKey: string,
  _context?: any
) {
  if (!apiKey) {
    throw new Error("OpenAI API key is required.");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a travel assistant for India.\nGive helpful, short, practical travel advice.\n\nInclude:\n- places\n- time required\n- tips\n- budget suggestions\n`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `OpenAI API error: ${res.status}`
    );
  }

  const data = await res.json();

  if (!data.choices?.[0]?.message?.content) {
    throw new Error("Invalid response from OpenAI API");
  }

  return data.choices[0].message.content;
}
