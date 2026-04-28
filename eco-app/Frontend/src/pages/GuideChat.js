import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Mic, MicOff, Download, Play, Pause, ArrowLeft, MoreVertical } from 'lucide-react';
import { chatApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/GuideChat.css';

const GuideChat = () => {
  const { chatId, guideId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sendingMessage, setSendingMessage] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchChat = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (chatId) {
        response = await chatApi.getById(chatId);
      } else if (guideId) {
        response = await chatApi.getOrCreate(guideId, null);
      }
      setChat(response.data);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId, guideId]);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      setAudioChunks([]);
      setRecordingTime(0);

      // Setup audio context for waveform visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      mediaRecorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      mediaRecorder.start();
      setIsRecording(true);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to record audio');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        sendAudioMessage(audioBlob, recordingTime);
      };
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const sendAudioMessage = async (audioBlob, duration) => {
    try {
      setSendingMessage(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('duration', duration);

      const response = await chatApi.sendAudio(chat._id, formData);

      setMessages((prev) => [...prev, response.data.message]);
      setRecordingTime(0);
      setAudioChunks([]);
    } catch (error) {
      console.error('Error sending audio message:', error);
      alert('Failed to send audio message');
    } finally {
      setSendingMessage(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      const response = await chatApi.sendMessage(chat._id, inputValue);

      setMessages((prev) => [...prev, response.data.message]);
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const playAudio = (audioUrl, messageId) => {
    if (playingAudioId === messageId) {
      setPlayingAudioId(null);
    } else {
      const audio = new Audio(audioUrl);
      audio.play();
      setPlayingAudioId(messageId);
      audio.onended = () => setPlayingAudioId(null);
    }
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="loading-spinner">Loading chat...</div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="chat-container">
        <div className="error-message">Chat not found</div>
      </div>
    );
  }

  const otherPerson = chat.userId._id === user._id ? chat.guideId : chat.userId;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate('/messages')}>
          <ArrowLeft size={20} />
        </button>
        <div className="chat-header-info">
          <h2 className="chat-header-name">{otherPerson.fullName || otherPerson.name}</h2>
          <p className="chat-header-status">Active now</p>
        </div>
        <button className="chat-menu-button">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id || message.timestamp}
              className={`message ${message.senderId === user._id ? 'sent' : 'received'}`}
            >
              <div className="message-bubble">
                {message.messageType === 'text' ? (
                  <p className="message-content">{message.content}</p>
                ) : (
                  <div className="audio-message">
                    <button
                      className="audio-play-button"
                      onClick={() => playAudio(message.audioUrl, message._id)}
                    >
                      {playingAudioId === message._id ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <span className="audio-duration">{message.duration}s</span>
                    <a href={message.audioUrl} download className="audio-download">
                      <Download size={16} />
                    </a>
                  </div>
                )}
                <span className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        {isRecording ? (
          <div className="recording-indicator">
            <div className="recording-dot"></div>
            <span>Recording: {recordingTime}s</span>
            <button className="stop-recording-button" onClick={stopRecording}>
              <MicOff size={20} />
            </button>
          </div>
        ) : (
          <form onSubmit={sendMessage} className="chat-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
              disabled={sendingMessage}
            />
            <button
              type="button"
              className="audio-button"
              onClick={startRecording}
              disabled={sendingMessage}
              title="Record audio message"
            >
              <Mic size={20} />
            </button>
            <button
              type="submit"
              className="send-button"
              disabled={!inputValue.trim() || sendingMessage}
            >
              <Send size={20} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default GuideChat;
