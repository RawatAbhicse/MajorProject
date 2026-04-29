export function detectIntent(message: string) {
  const msg = message.toLowerCase();

  if (msg.includes("near") || msg.includes("nearby")) {
    return "nearby";
  }

  if (msg.includes("plan") || msg.includes("itinerary")) {
    return "plan";
  }

  if (msg.includes("food") || msg.includes("restaurant")) {
    return "food";
  }

  return "general";
}