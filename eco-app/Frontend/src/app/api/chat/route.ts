import { detectIntent } from "../../../lib/intent";
import { getNearbyPlaces } from "../../../lib/places";
import { getAIResponse } from "../../../lib/ai";

// ⚠️ NOTE: This is a standard Request/Response handler.
// This project uses Create React App, not Next.js.
// To use this route you would need to migrate to Next.js or call it from a custom server.
export async function POST(req: Request) {
  try {
    const { message, location } = await req.json();

    const intent = detectIntent(message);

    // 🧭 Nearby Places
    if (intent === "nearby" && location) {
      const places = await getNearbyPlaces(
        location.lat,
        location.lng
      );

      return new Response(
        JSON.stringify({
          reply: `Here are some places nearby:\n\n${places
          .map((p: { name: string; distance: string }) => `• ${p.name} (${p.distance})`)
            .join("\n")}`,
        }), 
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 🧠 Default AI
    // In a real setup the API key should come from server-side env vars.
    const aiReply = await getAIResponse(message, "YOUR_API_KEY_HERE");

    return new Response(JSON.stringify({ reply: aiReply }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

