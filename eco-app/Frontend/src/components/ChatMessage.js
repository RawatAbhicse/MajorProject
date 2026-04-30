import "../styles/Chatbot.css";

export default function ChatMessage({ msg }) {
  const roleClass =
    msg.role === "user"
      ? "chat-message--user"
      : msg.role === "error"
      ? "chat-message--error"
      : "chat-message--assistant";

  return (
    <div className={`chat-message ${roleClass}`}>
      {msg.content}
    </div>
  );
}
