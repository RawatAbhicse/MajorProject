import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { hasFirebaseConfig, realtimeDb } from '../services/firebase';
import { ref, onValue, push, query, limitToLast, set } from 'firebase/database';
import '../styles/FriendsChat.css';

const FriendsChat = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [chatError, setChatError] = useState('');
  const [unreadByFriend, setUnreadByFriend] = useState({});
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem('userId');
  const LAST_SEEN_STORAGE_KEY = `chatLastSeen:${currentUserId || 'guest'}`;

  const getFriendId = (friend) => friend?.id || friend?._id;
  const getRoomId = (friend) => {
    const friendId = getFriendId(friend);
    if (!currentUserId || !friendId) return null;
    return [String(currentUserId), String(friendId)].sort().join('_');
  };
  const getLastSeenMap = () => {
    try {
      return JSON.parse(localStorage.getItem(LAST_SEEN_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  };
  const markRoomAsRead = (roomId, timestamp = Date.now()) => {
    if (!roomId) return;
    const currentMap = getLastSeenMap();
    const currentValue = currentMap[roomId] || 0;
    if (timestamp > currentValue) {
      const next = { ...currentMap, [roomId]: timestamp };
      localStorage.setItem(LAST_SEEN_STORAGE_KEY, JSON.stringify(next));
    }
  };
  const openFriendChat = (friend) => {
    setSelectedGroup(null);
    setSelectedFriend(friend);
    const friendId = getFriendId(friend);
    const roomId = getRoomId(friend);
    markRoomAsRead(roomId);
    setUnreadByFriend((prev) => ({ ...prev, [friendId]: false }));
  };
  const openGroupChat = (group) => {
    setSelectedFriend(null);
    setSelectedGroup(group);
  };
  const formatGroupTime = (timestamp) => new Date(timestamp).toLocaleString([], {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  });
  const formatMessageTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const shouldShowGroupTimestamp = (list, index) => {
    const current = list[index]?.timestamp;
    const previous = list[index - 1]?.timestamp;
    if (!current) return false;
    if (!previous) return true;
    const tenMinutes = 10 * 60 * 1000;
    return current - previous > tenMinutes;
  };

  useEffect(() => {
    fetchFriends();
    fetchRequests();
    searchUsers('');
  }, []);

  useEffect(() => {
    if ((selectedFriend || selectedGroup) && realtimeDb) {
      const isGroupChat = Boolean(selectedGroup);
      const roomId = isGroupChat ? selectedGroup.id : getRoomId(selectedFriend);
      if (!roomId) {
        setChatError(`Unable to open ${isGroupChat ? 'group' : 'chat'}. Missing information.`);
        setMessages([]);
        return undefined;
      }
      setChatError('');
      const messagesPath = isGroupChat ? `groupChats/${roomId}/messages` : `chats/${roomId}/messages`;
      const messagesRef = ref(realtimeDb, messagesPath);
      const unsubscribe = onValue(
        messagesRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const msgs = Object.values(data).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            setMessages(msgs);
            const latestTimestamp = msgs[msgs.length - 1]?.timestamp;
            if (latestTimestamp && !isGroupChat) {
              markRoomAsRead(roomId, latestTimestamp);
              const selectedFriendId = getFriendId(selectedFriend);
              setUnreadByFriend((prev) => ({ ...prev, [selectedFriendId]: false }));
            }
          } else {
            setMessages([]);
          }
        },
        () => {
          setChatError('Unable to read messages. Check Firebase Database rules/config.');
          setMessages([]);
        }
      );
      return () => unsubscribe();
    }
    return undefined;
  }, [selectedFriend, selectedGroup]);

  useEffect(() => {
    if (!realtimeDb || !currentUserId) return undefined;

    const groupsRef = ref(realtimeDb, 'groups');
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const nextGroups = Object.entries(data)
        .map(([id, group]) => ({ id, ...group }))
        .filter((group) => group?.members?.[currentUserId]);
      setGroups(nextGroups);
    });

    return () => unsubscribe();
  }, [realtimeDb, currentUserId]);

  useEffect(() => {
    if (!realtimeDb || !currentUserId || friends.length === 0) return undefined;

    const unsubscribers = friends
      .map((friend) => {
        const friendId = getFriendId(friend);
        const roomId = getRoomId(friend);
        if (!friendId || !roomId) return null;

        const latestMessageQuery = query(ref(realtimeDb, `chats/${roomId}/messages`), limitToLast(1));
        return onValue(latestMessageQuery, (snapshot) => {
          const data = snapshot.val();
          if (!data) {
            setUnreadByFriend((prev) => ({ ...prev, [friendId]: false }));
            return;
          }

          const latestMessage = Object.values(data)[0];
          const lastSeenMap = getLastSeenMap();
          const lastSeen = lastSeenMap[roomId] || 0;
          const latestTimestamp = latestMessage?.timestamp || 0;
          const isUnread = latestMessage?.senderId !== currentUserId && latestTimestamp > lastSeen;

          setUnreadByFriend((prev) => ({ ...prev, [friendId]: isUnread }));
        });
      })
      .filter(Boolean);

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [friends, realtimeDb, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends');
      setFriends(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/friends/requests');
      setRequests(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const sendRequest = async (toUserId) => {
    try {
      await api.post('/friends/request', { toUserId });
      alert('Request sent');
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send request');
    }
  };

  const acceptRequest = async (id) => {
    try {
      await api.put(`/friends/accept/${id}`);
      fetchRequests();
      fetchFriends();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to accept request');
    }
  };

  const declineRequest = async (id) => {
    try {
      await api.put(`/friends/decline/${id}`);
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to decline request');
    }
  };

  const searchUsers = async (query) => {
    if (query.length === 0) {
      try {
        const res = await api.get('/users/search');
        setSearchResults(res.data);
      } catch (error) {
        console.error(error);
      }
      return;
    }
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/users/search?q=${query}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || (!selectedFriend && !selectedGroup)) return;
    if (!realtimeDb || !hasFirebaseConfig) {
      setChatError('Chat is not configured. Add Firebase keys in Frontend/.env.');
      return;
    }
    const isGroupChat = Boolean(selectedGroup);
    const roomId = isGroupChat ? selectedGroup.id : getRoomId(selectedFriend);
    if (!roomId) {
      setChatError('Unable to send message. Missing user information.');
      return;
    }
    try {
      const messagesPath = isGroupChat ? `groupChats/${roomId}/messages` : `chats/${roomId}/messages`;
      const messagesRef = ref(realtimeDb, messagesPath);
      const newMsgRef = push(messagesRef);
      await set(newMsgRef, {
        text: newMessage.trim(),
        senderId: currentUserId,
        senderName: 'You',
        timestamp: Date.now(),
      });
      setNewMessage('');
      setChatError('');
    } catch (error) {
      console.error(error);
      setChatError('Failed to send message. Check Firebase config and permissions.');
    }
  };

  const toggleGroupMember = (friendId) => {
    setSelectedGroupMembers((prev) => (
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    ));
  };

  const createGroup = async () => {
    const trimmedName = groupName.trim();
    if (!trimmedName) {
      alert('Please enter a group name.');
      return;
    }
    if (selectedGroupMembers.length === 0) {
      alert('Select at least one friend for the group.');
      return;
    }
    if (!realtimeDb || !currentUserId) {
      alert('Firebase is not configured for group creation.');
      return;
    }

    try {
      const groupsRef = ref(realtimeDb, 'groups');
      const newGroupRef = push(groupsRef);
      const members = selectedGroupMembers.reduce(
        (acc, id) => ({ ...acc, [id]: true }),
        { [currentUserId]: true }
      );

      await set(newGroupRef, {
        name: trimmedName,
        createdBy: currentUserId,
        members,
        createdAt: Date.now(),
      });

      setShowCreateGroup(false);
      setGroupName('');
      setSelectedGroupMembers([]);
      setActiveTab('groups');
    } catch (error) {
      console.error(error);
      alert('Failed to create group. Please try again.');
    }
  };

  return (
    <div className="friends-chat">
      <div className="sidebar">
        <h3>Friends</h3>
        <div className="friends-tabs">
          <button
            className={activeTab === 'friends' ? 'active' : ''}
            onClick={() => setActiveTab('friends')}
          >
            Friends ({friends.length})
          </button>
          <button
            className={activeTab === 'requests' ? 'active' : ''}
            onClick={() => setActiveTab('requests')}
          >
            Requests ({requests.length})
          </button>
          <button
            className={activeTab === 'search' ? 'active' : ''}
            onClick={() => setActiveTab('search')}
          >
            Find Users
          </button>
          <button
            className={activeTab === 'groups' ? 'active' : ''}
            onClick={() => setActiveTab('groups')}
          >
            Groups ({groups.length})
          </button>
        </div>
        <button className="create-group-btn" onClick={() => setShowCreateGroup(true)}>
          + Create Group
        </button>

        {activeTab === 'friends' && (
          <ul>
            {friends.length === 0 && <li className="empty-state">No friends yet. Search users to send requests.</li>}
            {friends.map(friend => (
              <li
                key={getFriendId(friend)}
                onClick={() => openFriendChat(friend)}
                className={getFriendId(selectedFriend) === getFriendId(friend) ? 'active' : ''}
              >
                <span className="friend-avatar">
                  {(friend.fullName || friend.username).charAt(0).toUpperCase()}
                </span>
                <span className="friend-name">{friend.fullName || friend.username}</span>
                {unreadByFriend[getFriendId(friend)] && (
                  <span className="unread-dot" title="Unread messages" />
                )}
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'requests' && (
          <ul>
            {requests.length === 0 && <li className="empty-state">No pending friend requests.</li>}
            {requests.map(req => (
              <li key={req._id} className="request-item">
                <span className="request-name">{req.fromUser.fullName || req.fromUser.username}</span>
                <div className="request-actions">
                  <button className="accept-btn" onClick={() => acceptRequest(req._id)}>Accept</button>
                  <button className="decline-btn" onClick={() => declineRequest(req._id)}>Decline</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'search' && (
          <div className="search">
            <h4>Find Friends</h4>
            <input
              type="text"
              placeholder="Search users by name or username"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
            />
            {searchResults.length === 0 && (
              <p className="search-hint">
                {searchQuery.length < 2 ? 'Type at least 2 characters to search.' : 'No users found.'}
              </p>
            )}
            {searchResults.map(user => (
              <div key={user._id} className="search-result-item">
                <span>{user.username} {user.fullName && `(${user.fullName})`}</span>
                <button onClick={() => sendRequest(user._id)}>Add Friend</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'groups' && (
          <ul>
            {groups.length === 0 && <li className="empty-state">No groups yet. Create one to start group chat.</li>}
            {groups.map((group) => (
              <li
                key={group.id}
                onClick={() => openGroupChat(group)}
                className={selectedGroup?.id === group.id ? 'active' : ''}
              >
                <span className="friend-avatar">#</span>
                <span className="friend-name">{group.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="chat-area">
        {selectedFriend || selectedGroup ? (
          <>
            <h3>
              {selectedGroup
                ? `Group: ${selectedGroup.name}`
                : `Chat with ${selectedFriend.fullName || selectedFriend.username}`}
            </h3>
            {chatError && <p className="chat-error">{chatError}</p>}
            <div className="messages">
              {messages.map((msg, idx) => (
                <React.Fragment key={idx}>
                  {shouldShowGroupTimestamp(messages, idx) && msg.timestamp && (
                    <div className="message-group-time">{formatGroupTime(msg.timestamp)}</div>
                  )}
                  <div className={msg.senderId === currentUserId ? 'my-message' : 'their-message'}>
                    <span className="message-text">{msg.text}</span>
                    {msg.timestamp && (
                      <span className="message-time">{formatMessageTime(msg.timestamp)}</span>
                    )}
                  </div>
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message"
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <p>Select a friend or group to start chatting</p>
        )}
      </div>

      {showCreateGroup && (
        <div className="group-modal-overlay">
          <div className="group-modal">
            <h3>Create Group</h3>
            <input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <p className="group-modal-subtitle">Select friends to add:</p>
            <div className="group-members-list">
              {friends.map((friend) => {
                const friendId = getFriendId(friend);
                return (
                  <label key={friendId} className="group-member-item">
                    <input
                      type="checkbox"
                      checked={selectedGroupMembers.includes(friendId)}
                      onChange={() => toggleGroupMember(friendId)}
                    />
                    <span>{friend.fullName || friend.username}</span>
                  </label>
                );
              })}
            </div>
            <div className="group-modal-actions">
              <button className="cancel-btn" onClick={() => setShowCreateGroup(false)}>Cancel</button>
              <button className="create-btn" onClick={createGroup}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsChat;
