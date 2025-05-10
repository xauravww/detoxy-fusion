import React, { useState, useEffect, useContext } from 'react';
import { webSocketContext } from '../context/Websocket';
import { sidebarContext } from '../context/Sidebar';
import axios from 'axios';
import { FaComments, FaUserSlash, FaBan, FaUserCheck } from 'react-icons/fa';

const FriendModal = ({ isOpen, onClose, currentUserId, token }) => {
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setSelectedChat, setIsOpen } = useContext(sidebarContext);

  const fetchFriends = async (query = '') => {
    setLoading(true);
    try {
      let res;
      if (query.trim() === '') {
        res = await axios.get(`/api/users/${currentUserId}/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await axios.get(`/api/users/${currentUserId}/friends/search?query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setFriends(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUserId && token) {
      setSearch('');
      fetchFriends();
    }
  }, [isOpen, currentUserId, token]);

  const handleSearch = () => {
    fetchFriends(search);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleChat = (friend) => {
    setSelectedChat({
      id: friend._id,
      name: friend.username,
      profilePicture: friend.profilePicture,
      isAI: false,
    });
    setIsOpen(true);
    onClose();
  };

  const handleUnfriend = async (friendId, friendName) => {
    if (!window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)) return;
    await axios.post(`/api/users/${friendId}/unfriend`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFriends(friends.filter(f => f._id !== friendId));
  };

  const handleBlock = async (friendId, friendName) => {
    if (!window.confirm(`Block ${friendName}? They won't be able to message you.`)) return;
    await axios.post(`/api/users/${friendId}/block`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFriends(friends.map(f => f._id === friendId ? { ...f, isBlocked: true } : f));
  };

  const handleUnblock = async (friendId, friendName) => {
    if (!window.confirm(`Unblock ${friendName}?`)) return;
    await axios.post(`/api/users/${friendId}/unblock`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFriends(friends.map(f => f._id === friendId ? { ...f, isBlocked: false } : f));
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(6px)'
    }}>
      <style>{`
        .friend-modal-content {
          background: rgba(30, 32, 40, 0.95);
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          width: 95vw;
          max-width: 420px;
          padding: 32px 24px 24px 24px;
          position: relative;
          animation: fadeInUp 0.4s;
        }
        .friend-modal-close {
          position: absolute; top: 18px; right: 18px;
          background: #23272f; color: #fff; border: none; border-radius: 8px; padding: 6px 16px; font-weight: 600; cursor: pointer;
          transition: background 0.2s;
        }
        .friend-modal-close:hover { background: #444; }
        .friend-modal-title { text-align: center; font-size: 1.5rem; font-weight: 700; margin-bottom: 18px; letter-spacing: 1px; }
        .friend-modal-searchbar {
          display: flex; align-items: center; margin-bottom: 22px; background: #23272f; border-radius: 10px; padding: 4px 8px;
          border: 2px solid #007bff;
        }
        .friend-modal-searchbar input {
          flex: 1; background: transparent; border: none; color: #fff; font-size: 1rem; padding: 8px 0; outline: none;
        }
        .friend-modal-searchbar input::placeholder { color: #aaa; }
        .friend-modal-searchbar button {
          background: #00bfff; color: #fff; border: none; border-radius: 8px; padding: 7px 18px; font-weight: 700; margin-left: 8px; cursor: pointer;
          transition: background 0.2s;
        }
        .friend-modal-searchbar button:hover { background: #007bff; }
        .friend-card {
          display: flex; align-items: center; background: #23272f; border-radius: 12px; margin-bottom: 16px; padding: 12px 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10); transition: background 0.2s, box-shadow 0.2s;
          flex-wrap: wrap;
        }
        .friend-card:hover { background: #2c3140; box-shadow: 0 4px 16px rgba(0,0,0,0.13); }
        .friend-avatar {
          width: 48px; height: 48px; border-radius: 50%; margin-right: 16px; object-fit: cover; border: 2px solid #444;
        }
        .friend-username { flex: 1; font-size: 1.1rem; font-weight: 600; color: #fff; min-width: 0; }
        .friend-actions {
          display: flex; flex-wrap: wrap; gap: 6px; margin-left: auto;
        }
        .friend-actions button {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 12px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;
          font-size: 1rem;
        }
        .friend-actions .chat { background: #007bff; color: #fff; }
        .friend-actions .chat:hover { background: #0056b3; }
        .friend-actions .unfriend { background: #dc3545; color: #fff; }
        .friend-actions .unfriend:hover { background: #a71d2a; }
        .friend-actions .block { background: #6c757d; color: #fff; }
        .friend-actions .block:hover { background: #495057; }
        .friend-actions .unblock { background: #00b894; color: #fff; }
        .friend-actions .unblock:hover { background: #00806a; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
      `}</style>
      <div className="friend-modal-content">
        <button className="friend-modal-close" onClick={onClose}>Close</button>
        <div className="friend-modal-title">Friends</div>
        <div className="friend-modal-searchbar">
          <input
            placeholder="Search friends by name or username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        {loading ? <div style={{ textAlign: 'center', color: '#aaa' }}>Loading...</div> : (
          <div>
            {(Array.isArray(friends) ? friends : []).length === 0 && (
              <div style={{ color: '#aaa', textAlign: 'center', padding: 24, fontSize: 18, fontWeight: 500, opacity: 0.7 }}>
                No friends found.<br /><span style={{ fontSize: 14, color: '#007bff' }}>Try searching by username or name.</span>
              </div>
            )}
            {(Array.isArray(friends) ? friends : []).map(friend => (
              <div key={friend._id} className="friend-card">
                <img src={friend.profilePicture || '/default-profile-pic.png'} alt="" className="friend-avatar" />
                <span className="friend-username">{friend.username}</span>
                <div className="friend-actions">
                  <button className="chat" onClick={() => handleChat(friend)}><FaComments />Chat</button>
                  <button className="unfriend" onClick={() => handleUnfriend(friend._id, friend.username)}><FaUserSlash />Unfriend</button>
                  {friend.isBlocked ? (
                    <button className="unblock" onClick={() => handleUnblock(friend._id, friend.username)}><FaUserCheck />Unblock</button>
                  ) : (
                    <button className="block" onClick={() => handleBlock(friend._id, friend.username)}><FaBan />Block</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendModal;