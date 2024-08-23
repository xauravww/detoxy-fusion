import  { useState, useEffect, useContext } from "react";
import axios from "axios";
import { sidebarContext } from "../context/Sidebar";
import { webSocketContext } from "../context/Websocket";

const Sidebar = () => {
  const { setSelectedChat, setIsOpen } = useContext(sidebarContext);
  const { onlineUsers } = useContext(webSocketContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch contacts data from the backend
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`)
      .then((response) => {
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
        console.error("Error fetching contacts:", error);
        setLoading(false); // Set loading to false even if there's an error
      });
  }, []);

  // Function to check if a user is online
  const isOnline = (userId) => {
    return Object.keys(onlineUsers).includes(userId);
  };

  const handleContactClick = (contact) => {
    setSelectedChat(contact);
    setIsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col w-[90vw] overflow-y-hidden md:w-auto p-4">
        {/* Skeleton Loader */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center p-2 mb-2 bg-white bg-opacity-20 rounded-lg shadow-lg animate-pulse">
            <div className="w-10 h-10 bg-gray-700 rounded-full mr-3"></div>
            <div>
              <div className="bg-gray-700 h-4 w-32 rounded-md mb-2"></div>
              <div className="bg-gray-700 h-3 w-24 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Separate contacts into online and offline
  const onlineContacts = contacts.filter(contact => isOnline(contact.id));
  const offlineContacts = contacts.filter(contact => !isOnline(contact.id));

  return (
    <div className="flex flex-col overflow-y-auto md:w-auto">
      <div className=" flex-1 overflow-y-auto p-4">
        {/* Fixed AI Assistant */}
        <div
          key="my-ai-assistant"
          className="flex items-center p-2 mb-2 bg-white bg-opacity-20 rounded-lg shadow-lg cursor-pointer"
          onClick={() => handleContactClick({
            id: 4,
            name: "My AI Assistant",
            profilePicture: "", // No profile picture for AI Assistant
            isAI: true,
          })}
        >
          <div className={`w-10 h-10 rounded-full mr-3 object-cover bg-gradient-to-r from-indigo-500 to-purple-500`}></div>
          <div>
            <p className="text-sm font-semibold text-white">My AI Assistant</p>
            <p className="text-xs text-gray-300">Active now</p>
          </div>
        </div>
        
        {/* Online Users Section */}
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
                  <p className="text-sm font-semibold text-white">{contact.name}</p>
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
    </div>
  );
};

export default Sidebar;
