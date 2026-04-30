"use client";

import { useState, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import "../styles/Chatbot.css";
// Bot icon will be imported in Navbar

interface ChatbotSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function ChatbotSidebar({ open = false, onClose }: ChatbotSidebarProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [location, setLocation] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);

  // Sync with external open prop
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  // Handle close
  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

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
    if (!input || isSending) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          location,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error || `Request failed (${res.status})`;
        setMessages((prev) => [...prev, { role: "error", content: msg }]);
        return;
      }

      const reply = data?.reply || "Sorry, I couldn't generate a reply.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      if (data?.aiUsed === false && data?.aiError) {
        setMessages((prev) => [
          ...prev,
          { role: "error", content: `AI unavailable: ${data.aiError}` },
        ]);
      }

      setInput("");
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "error", content: err?.message || "Network error" },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Sidebar (controlled by props) */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="chatbot-overlay"
            onClick={handleClose}
          />
          {/* Sidebar */}
          <div className="chatbot-sidebar">
            <div className="chatbot-header">
              Travel Assistant
              <button 
                className="chatbot-close-btn"
                onClick={handleClose}
              >
                ✕
              </button>
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
                  disabled={isSending}
                />
                <button
                  onClick={sendMessage}
                  className="chatbot-send-btn"
                  disabled={isSending}
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
   );
}
