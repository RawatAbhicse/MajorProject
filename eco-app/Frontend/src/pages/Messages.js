import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Plus, Search, Trash2 } from 'lucide-react';
import { guideApi, chatApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Messages.css';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [loadingGuides, setLoadingGuides] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getAll();
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuides = async () => {
    try {
      setLoadingGuides(true);
      const response = await guideApi.getAll();
      setGuides(response.data);
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoadingGuides(false);
    }
  };

  const handleStartChat = async (guide) => {
    try {
      const response = await chatApi.getOrCreate(guide._id, null);
      navigate(`/chat/${response.data._id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat');
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await chatApi.delete(chatId);
        setChats(chats.filter(c => c._id !== chatId));
      } catch (error) {
        console.error('Error deleting chat:', error);
        alert('Failed to delete chat');
      }
    }
  };

  const filteredChats = chats.filter(chat => {
    const otherPerson = chat.userId._id === user._id ? chat.guideId : chat.userId;
    const name = otherPerson.fullName || otherPerson.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleOpenNewChat = () => {
    fetchGuides();
    setShowNewChatModal(true);
  };

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h1 className="messages-title">Messages</h1>
        <button className="new-chat-button" onClick={handleOpenNewChat}>
          <Plus size={20} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="messages-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="messages-list">
        {loading ? (
          <div className="loading-message">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="empty-message">
            <MessageCircle size={48} />
            <p>No chats yet. Start a conversation with a guide!</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const otherPerson = chat.userId._id === user._id ? chat.guideId : chat.userId;
            return (
              <Link
                key={chat._id}
                to={`/chat/${chat._id}`}
                className="chat-item"
              >
                <div className="chat-item-avatar">
                  {(otherPerson.fullName || otherPerson.name || '?')[0].toUpperCase()}
                </div>
                <div className="chat-item-content">
                  <div className="chat-item-header">
                    <h3 className="chat-item-name">
                      {otherPerson.fullName || otherPerson.name}
                    </h3>
                    <span className="chat-item-time">
                      {chat.lastMessageTime && new Date(chat.lastMessageTime).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="chat-item-message">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="unread-badge">{chat.unreadCount}</div>
                )}
                <button
                  className="delete-chat-button"
                  onClick={(e) => handleDeleteChat(chat._id, e)}
                  title="Delete chat"
                >
                  <Trash2 size={16} />
                </button>
              </Link>
            );
          })
        )}
      </div>

      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Start New Chat</h2>
            <div className="modal-guides-list">
              {loadingGuides ? (
                <p className="loading-message">Loading guides...</p>
              ) : guides.length === 0 ? (
                <p className="no-guides-message">No guides available</p>
              ) : (
                guides.map((guide) => (
                  <button
                    key={guide._id}
                    className="guide-item"
                    onClick={() => {
                      handleStartChat(guide);
                      setShowNewChatModal(false);
                    }}
                  >
                    <div className="guide-item-avatar">
                      {(guide.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="guide-item-info">
                      <h4 className="guide-item-name">{guide.name}</h4>
                      <p className="guide-item-specialties">
                        {guide.specialties?.join(', ') || 'Guide'}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <button
              className="modal-close-button"
              onClick={() => setShowNewChatModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
