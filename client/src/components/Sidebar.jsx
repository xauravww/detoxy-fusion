import  { useState, useEffect, useContext } from "react";
import axios from "axios";
import { sidebarContext } from "../context/Sidebar";
import { webSocketContext } from "../context/Websocket";
import HamsterLoader from './Loader/HamsterLoader';
import FriendModal from './FriendModal';

const Sidebar = () => {
  const { setSelectedChat, setIsOpen } = useContext(sidebarContext);
  const { onlineUsers, socketRef } = useContext(webSocketContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username , setUsername] = useState("")
  const [isFriendModalOpen, setFriendModalOpen] = useState(false);
  const userObj = JSON.parse(localStorage.getItem('user'));
  const currentUserId = userObj?._id || userObj?.user?._id;
  const token = localStorage.getItem('JWT_TOKEN');

  // Mark user as online on mount (login) and when tab is active/visible
  useEffect(() => {
    const sendRegister = () => {
      if (socketRef && socketRef.current && currentUserId && token && socketRef.current.readyState === 1) {
        socketRef.current.send(JSON.stringify({ type: 'register', userId: currentUserId, token }));
      }
    };
    sendRegister(); // On mount and when userId/token change
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        sendRegister();
      }
    };
    const handleFocus = () => {
      sendRegister();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [socketRef, currentUserId, token]);

  // Fetch contacts data from the backend
  useEffect(() => {
    if(localStorage.getItem('user')){
      setUsername(JSON.parse(localStorage.getItem('user'))?.user?.username || "guest_username")
    }

    if (currentUserId) {
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/${currentUserId}/friends`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('JWT_TOKEN')}` }
      })
        .then((response) => {
          setLoading(true)
          const formattedContacts = response.data.map(user => ({
            id: user._id,
            name: user.username,
            profilePicture: user.profilePicture,
            isAI: false, // Adjust if you have AI contacts
          }));
          setContacts(formattedContacts);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching friends:", error);
          setLoading(false); // Set loading to false even if there's an error
        });
    }
  }, []);

  // Function to check if a user is online
  const isOnline = (userId) => {
    return Object.keys(onlineUsers).includes(userId);
  };

  const handleContactClick = (contact) => {
    setSelectedChat(contact);
    setIsOpen(true);
    // Mark user as online when clicking chat
    if (socketRef && socketRef.current && currentUserId && token && socketRef.current.readyState === 1) {
      socketRef.current.send(JSON.stringify({ type: 'register', userId: currentUserId, token }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
        <HamsterLoader />
      </div>
    );
  }

  if (contacts.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p>No friends yet.</p>
        <p>Add friends to start chatting!</p>
      </div>
    );
  }

  // Separate contacts into online and offline
  const onlineContacts = contacts.filter(contact => isOnline(contact.id));
  const offlineContacts = contacts.filter(contact => !isOnline(contact.id));

  return (
    <div className="flex flex-col overflow-y-auto md:w-auto">
      <div className=" flex-1 overflow-y-auto p-4">
    
        {/* Online Users Section */}
        {/* Show also his own username */}
        {currentUserId && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-200">Your Chat</h2>
            <div
              className="flex items-center p-2 mb-2 bg-white bg-opacity-20 rounded-lg shadow-lg cursor-pointer"
              onClick={() => handleContactClick({id: currentUserId, name: username, profilePicture: null})}
            >
              <img
                src="/assets/anonymous.svg"
                alt={username}
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-white">{username} (You)</p>
                <p className="text-xs text-gray-300">Active now</p>
              </div>
            </div>
          </div>
        )}

        
        {onlineContacts.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-200">Online</h2>
            {onlineContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center p-2 mb-2 bg-white bg-opacity-20 rounded-lg shadow-lg cursor-pointer"
                onClick={() => handleContactClick(contact)}
              >
                <img
                  src={contact.profilePicture || "/assets/anonymous.svg"}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{contact.name == username? `${contact.name}  (You)`:contact.name}</p>
                  <p className="text-xs text-gray-300">Active now</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Offline Users Section */}
        {offlineContacts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-200">Offline</h2>
            {offlineContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center p-2 mb-2 bg-white bg-opacity-20 rounded-lg shadow-lg cursor-pointer"
                onClick={() => handleContactClick(contact)}
              >
                <img
                  src={contact.profilePicture || "/assets/anonymous.svg"}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover bg-gray-500"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{contact.name}</p>
                  <p className="text-xs text-gray-300">Offline</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => currentUserId && setFriendModalOpen(true)}
        style={{ width: '100%', margin: '12px 0', padding: 8, background: '#007bff', color: '#fff', border: 'none', borderRadius: 4 }}
        disabled={!currentUserId}
      >
        Friends
      </button>
      <FriendModal
        isOpen={isFriendModalOpen}
        onClose={() => setFriendModalOpen(false)}
        currentUserId={currentUserId}
        token={token}
      />
    </div>
  );
};

export default Sidebar;
