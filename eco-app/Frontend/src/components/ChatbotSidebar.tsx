"use client";

import { useState } from "react";
import ChatMessage from "./ChatMessage";
import "../styles/Chatbot.css";

export default function ChatbotSidebar() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [location, setLocation] = useState<any>(null);

  // 📍 Get location
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  };

  // 📤 Send message
  const sendMessage = async () => {
    if (!input) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input,
        location,
      }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply },
    ]);

    setInput("");
  };

  return (
    <>
      {/* Toggle */}
      <button
        className="chatbot-toggle"
        onClick={() => setOpen(!open)}
      >
        💬
      </button>

      {/* Sidebar */}
      {open && (
        <div className="chatbot-sidebar">
          <div className="chatbot-header">
            Travel Assistant
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-empty">
                Ask me anything about travel!
              </div>
            )}
            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} />
            ))}
          </div>

          <div className="chatbot-input-area">
            <button
              onClick={getLocation}
              className="chatbot-location-btn"
            >
              📍 Use my location
            </button>

            <div className="chatbot-input-row">
              <input
                className="chatbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about travel..."
              />
              <button
                onClick={sendMessage}
                className="chatbot-send-btn"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}