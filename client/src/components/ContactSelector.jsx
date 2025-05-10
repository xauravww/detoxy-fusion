import { useContext, useEffect, useState } from "react";
import { sidebarContext } from "../context/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import HamsterLoader from './Loader/HamsterLoader';

const ContactSelector = ({ onSelect, onClose, imageDetails }) => {
  const { selectedChat } = useContext(sidebarContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`);
        console.log("API response data:", response.data); // Debugging line
        const formattedContacts = response.data.map(user => ({
          id: user._id,
          name: user.username,
          status: user.status || "Offline", // Default status if not provided
          bgColor: "bg-gray-500", // Default background color or set as needed
          isAI: false, // Adjust if you have AI contacts
        }));
        setContacts(formattedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setError("Failed to fetch contacts");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleContactClick = (contact) => {
    onSelect(contact);
  };

  const handlePostToFeed = async () => {
    if (imageDetails) {
      console.log("Image details for feed:", JSON.stringify(imageDetails));
      const payload = {
        url: imageDetails.imageUrl,
        prompt: imageDetails.text || "",
        user: imageDetails.user?._id || JSON.parse(localStorage.getItem("user")).id,
        settings: imageDetails.settings,
        username: imageDetails.username,
      };

      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/posts`, payload,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
          },
        });
        if (response.status === 201) {
          toast.success('Chat posted to feed!');
          navigate('/feed', { state: { scrollToBottom: true } });
        } else {
          toast.error('Failed to post chat to feed.');
        }
      } catch (error) {
        console.error("Error posting to feed:", error);
        toast.error('Failed to post chat to feed.');
      }
    } else {
      toast.error('No image details available to post.');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    contact.id !== selectedChat?.id // Exclude the current chat
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HamsterLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-gray-800 p-4 rounded-lg w-80 max-w-md text-white">
          <p>{error}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-4"
            onClick={() => setLoading(true)} // Retry fetching data
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
      </div>
    </div>
  );
};

export default ContactSelector;
