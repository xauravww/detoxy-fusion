import  { useContext, useEffect, useState } from "react";
import { sidebarContext } from "../context/Sidebar";
import axios from "axios";

const contacts = [
  {
    id: 1,
    name: "Saurav Maheshwari",
    status: "Active now",
    bgColor: "bg-gradient-to-r from-green-500 to-blue-500",
    isAI: false,
  },
  {
    id: 2,
    name: "John Doe",
    status: "Away",
    bgColor: "bg-gradient-to-r from-red-500 to-yellow-500",
    isAI: false,
  },
  {
    id: 3,
    name: "Jane Smith",
    status: "Do not disturb",
    bgColor: "bg-gradient-to-r from-gray-500 to-black",
    isAI: false,
  },
  {
    id: 4,
    name: "My AI Assistant",
    status: "Active now",
    bgColor: "bg-gradient-to-r from-indigo-500 to-purple-500",
    isAI: true,
  },
];

const ContactSelector = ({ onSelect, onClose, imageDetails }) => {
  const { selectedChat, setSelectedChat } = useContext(sidebarContext);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.log('imageDetails', imageDetails);
  }, [imageDetails]);

  const handleContactClick = (contact) => {
    onSelect(contact);
  };

  const handlePostToFeed = async () => {
    if (imageDetails) {
      const payload = {
        url: imageDetails.imageUrl, // Use the actual image URL from imageDetails
        prompt: imageDetails.prompt || "", // Use the prompt from imageDetails
        user: imageDetails.user?._id || JSON.parse(localStorage.getItem("user")).id, // Use the user id from imageDetails
        settings: imageDetails.settings, // Use the settings from imageDetails
      };

      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/posts`, payload);
        if (response.status === 201) {
          alert('Chat posted to feed!');
        } else {
          alert('Failed to post chat to feed.');
        }
      } catch (error) {
        console.error("Error posting to feed:", error);
        alert('Failed to post chat to feed.');
      }
    } else {
      alert('No image details available to post.');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    contact.id !== selectedChat?.id // Exclude the current chat
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-800 p-4 rounded-lg w-80 max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-white">Select a Contact</h2>

        <input
          type="text"
          placeholder="Search friends..."
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="h-32 overflow-y-auto">
          <div className="flex flex-col">
            {filteredContacts.slice(0, 3).map((contact) => (
              <div
                key={contact.id}
                className="flex items-center p-2 mb-2 bg-gray-700 rounded-lg shadow-lg cursor-pointer hover:bg-gray-600"
                onClick={() => handleContactClick(contact)}
              >
                <div className={`w-10 h-10 ${contact.bgColor} rounded-full mr-3`}></div>
                <div>
                  <p className="text-sm font-semibold text-gray-100">{contact.name}</p>
                  <p className="text-xs text-gray-400">{contact.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handlePostToFeed}
          >
            Post to Feed
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
        {/* <p className="mt-2 text-gray-400 text-sm">Send to friends available soon</p> */}
      </div>
    </div>
  );
};

export default ContactSelector;
