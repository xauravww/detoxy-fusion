import { useState, useEffect, useRef, useContext } from "react";

import { SentimentIntensityAnalyzer } from "vader-sentiment";
import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";
import { sidebarContext } from "../context/Sidebar";
import Sidebar from "./Sidebar";
import ContactSelector from "./ContactSelector";
import SettingsPanel from "./SettingsPanel";
import { settingsPanelContext } from "../context/SettingsPanel";
import HamsterLoader from "./Loader/HamsterLoader";

import axios from "axios";
import { webSocketContext } from "../context/Websocket";
import { useNavigate } from "react-router-dom";

const vaderAnalyzer = SentimentIntensityAnalyzer;
const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

function Chat() {
  const { sendMessage, messages, setMessages, message, input, setInput } =
    useContext(webSocketContext);
 
  const [loading, setLoading] = useState(false);

  const [sendingStatus, setSendingStatus] = useState({});
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState(null);

  const commands = [
    { name: "/imagine", description: "Generate your images with AI" },
  ];

  const { settings, setSettings } = useContext(settingsPanelContext);
  const messagesEndRef = useRef(null);
  const {
    isOpen,
    setIsOpen,
    selectedChat,
    isLastScreenClosed,
    setIsLastScreenClosed,
  } = useContext(sidebarContext);

  const whiteColorFilter =
    "invert(100%) sepia(0%) saturate(7498%) hue-rotate(184deg) brightness(98%) contrast(98%)";

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (e.target.value.startsWith("/")) {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  };

  const handleDownloadImage = (imageUrl, fileName) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = fileName || "download";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  const senderId = JSON.parse(localStorage.getItem("user")).id;
  const contactId = selectedChat?.id;
  const fetchMessages = async () => {
    console.log("sender id: " + senderId)
    console.log("contact id: " + contactId)
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/message`,
        {
          params: { senderId, contactId },
        }
      );
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
   
    if (contactId) {
      fetchMessages();
    }
  }, [contactId, senderId, setMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, message]);

  const handleSendMessage = async () => {
    if (input.trim() && !loading && selectedChat) {
      const messageId = Date.now();
      const senderId = JSON.parse(localStorage.getItem("user")).id;
      const contactId = selectedChat.id;

      const newMessage = {
        text: input,
        senderId,
        id: messageId,
        contactId,
      };

      setMessages((prevMessages) => [...(prevMessages || []), newMessage]);
      setInput("");
      setSendingStatus((prev) => ({ ...prev, [messageId]: "sending" }));

      try {
        if (input.startsWith("/imagine ")) {
          const prompt = input.slice(9); // to remove imagine
          setLoading(true);

          const imageResponse = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/generateImage`,
            { prompt, settings }
          );

          const imageUrl = imageResponse.data.imageUrl;

          const aiMessage = {
            text: prompt,
            senderId: senderId,
            id: Date.now(),
            contactId,
            imageUrl,
            prompt,
            settings,
            user: JSON.parse(localStorage.getItem("user")).user,
            type: "image",
            username:JSON.parse(localStorage.getItem("user")).user.username || "",
          };

          setMessages((prevMessages) => [...prevMessages, aiMessage]);
          sendMessage(aiMessage);

          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/message`, {
            text: prompt,
            senderId,
            id: Date.now(),
            contactId,
            imageUrl,
            prompt,
            settings,
            user: JSON.parse(localStorage.getItem("user")).user,
            type: "image",
            username:JSON.parse(localStorage.getItem("user")).user.username || "",
          });

          console.log("getting imageurl in frontend after posting " + imageUrl);

          setSendingStatus((prev) => ({ ...prev, [messageId]: "sent" }));
        } else {
          const hasOffensiveContent = matcher.hasMatch(input);
          const sentiment = vaderAnalyzer.polarity_scores(input);
          const isNegative = sentiment.compound < -0.5;

          if (hasOffensiveContent || isNegative) {
            setSendingStatus((prev) => ({ ...prev, [messageId]: "cant-send" }));
            alert(
              "Message contains inappropriate content or negative sentiment and can't be sent."
            );
          } else {
            const response = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/message`,
              {
                text: input,
                senderId,
                id: messageId,
                contactId,
                type: "message",
                username:JSON.parse(localStorage.getItem("user")).user.username || "",
              }
            );

            sendMessage({
              text: input,
              senderId,
              id: messageId,
              contactId,
              username:JSON.parse(localStorage.getItem("user")).user.username || "",
            });

            const responseText = response.data.responseText;

            const aiResponse = {
              prompt:responseText,
              text: responseText,
              senderId: senderId,
              id: Date.now(),
              contactId,
              username:JSON.parse(localStorage.getItem("user")).user.username || "",
              settings
            };

            setMessages((prevMessages) => [...prevMessages, aiResponse]);
            setSendingStatus((prev) => ({ ...prev, [messageId]: "sent" }));
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setSendingStatus((prev) => ({ ...prev, [messageId]: "error" }));
        alert("An error occurred while sending your message.");
      } finally {
        setShowCommands(false);
        setLoading(false);
      }
    }
  };

  const handleForwardImage = (message) => {
    setSelectedContact(message);
    setShowContactSelector(true);
  };

  const handleContactSelect = (contact, imageDetails) => {
    if (contact && imageDetails) {
      const forwardMessage = {
        ...imageDetails,
        id: Date.now(),
        contactId: contact.id,
      };
      setMessages((prevMessages) => [...prevMessages, forwardMessage]);
      setShowContactSelector(false);
    }
  };

  const handleSettingsChange = (newSettings) => {
    setSettings((prevSettings) => ({ ...prevSettings, ...newSettings }));
  };

  const handleCommandSelect = (command) => {
    setSelectedCommand(command);
    setShowCommands(false);
    setInput(command);
  };

  const filteredMessages = messages.filter(
    (message) =>
      (message.contactId === selectedChat?.id &&
        message.senderId === JSON.parse(localStorage.getItem("user")).id) ||
      (message.contactId === JSON.parse(localStorage.getItem("user")).id &&
        message.senderId === selectedChat?.id)
  );

  useEffect(() => {
    const listener = document.addEventListener("click", () => {
      setShowCommands(false);
    });
    fetchMessages()
    

    return () => {
      if (listener) {
        document.removeEventListener(listener);
      }
    };
  }, []);

  const navigate = useNavigate();
  useEffect(() => {
    if (isLastScreenClosed) {
      navigate("/");
    }
  }, [isLastScreenClosed]);

  return (
    <div className="flex max-w-screen w-full bg-gradient-to-r from-gray-800 via-gray-900 to-black h-[calc(100vh-11vh)] md:h-[calc(100vh-11vh)] lg:h-[calc(100vh-10vh)]">
      <div
        className={`sidebar ${
          isOpen ? "hidden" : "w-[100vw]"
        } md:block w-1/4 bg-opacity-70 backdrop-filter backdrop-blur-lg p-4 rounded-lg glass z-[1]`}
      >
        <div className="flex justify-between items-center w-full">
          <div className="text-lg font-semibold text-gray-100">Contacts</div>
          <img
            src="/assets/cross.svg"
            className="send w-10 h-10 lg:hidden"
            style={{ filter: whiteColorFilter }}
            onClick={() => setIsLastScreenClosed(true)}
          />
        </div>
        <Sidebar />
      </div>

      {isOpen && (
        <div className="main-chats flex flex-col w-full md:w-3/4 h-full bg-opacity-70 backdrop-filter backdrop-blur-lg glass p-3 ">
          {isOpen && selectedChat && (
            <>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-lg">
                <div className="flex items-center">
                
                  <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full mr-3">
                    {/* img here */}
                    <img src={selectedChat.profilePicture} alt="avatar" className="rounded-full object-cover w-full h-full" />
                  </div>
                  <h2 className="text-lg font-semibold">{selectedChat.name}</h2>
                </div>
                <button className="text-sm" onClick={() => setIsOpen(!isOpen)}>
                  <img
                    src="/assets/cross.svg"
                    className="send w-10 h-10"
                    style={{ filter: whiteColorFilter }}
                  />
                </button>
              </div>
              <div className="flex-1 p-4 overflow-auto bg-gray-800 bg-opacity-50 rounded-b-lg shadow-lg">
                {filteredMessages
                  .filter((message) => message.text || message.imageUrl)
                  .map((message) => {
                    const user = JSON.parse(localStorage.getItem("user")); // Parse the stored user object
                    const isCurrentUser = message.senderId === user.id; // Check if the message was sent by the current user

                    return (
                      <div
                        key={message.id}
                        className={`flex mb-4 ${
                          isCurrentUser && message.type != "image"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg max-w-xs shadow ${
                            isCurrentUser
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {message.text && <p>{message.text}</p>}
                          {message.imageUrl && (
                            <div className="relative">
                              <img
                                src={message.imageUrl}
                                alt="Generated"
                                className="w-full rounded-lg mt-2"
                              />
                              {isCurrentUser && (
                                <>
                                  <img
                                    className="absolute lg:-right-20 lg:top-24 right-4 top-4 rounded-md h-10 w-10 bg-gray-800 p-2 cursor-pointer"
                                    onClick={() => handleForwardImage(message)}
                                    src="/assets/forward.svg"
                                    style={{ filter: whiteColorFilter }}
                                  />
                                  <img
                                    className="absolute lg:-right-20 lg:top-44 right-4 top-16 rounded-md h-10 w-10 bg-gray-800 p-2 cursor-pointer"
                                    onClick={() => handleDownloadImage(message)}
                                    src="/assets/download.svg"
                                    style={{ filter: whiteColorFilter }}
                                  />
                                </>
                              )}
                            </div>
                          )}
                          <div className="text-sm text-gray-400 mt-1">
                            {sendingStatus[message.id] === "sending" &&
                              "Sending..."}
                            {sendingStatus[message.id] === "sent" && (
                              <span className="text-green-400">✔️ Sent</span>
                            )}
                            {sendingStatus[message.id] === "cant-send" && (
                              <span className="text-red-400">
                                ❌ Can't Send
                              </span>
                            )}
                            {sendingStatus[message.id] === "error" && (
                              <span className="text-red-400">❌ Error</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef}></div>
              </div>

              <div className="py-3 border-t border-gray-700 flex items-center relative">
                <input
                  type="text"
                  className="flex-1 p-2 border-none rounded-md bg-gray-700 bg-opacity-60 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message or press / for commands..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                {showCommands && (
                  <div className="absolute left-0 bottom-full mb-2 w-full bg-gray-800 text-white rounded-lg shadow-lg z-10">
                    {commands.map((command, index) => (
                      <button
                        key={index}
                        onClick={() => handleCommandSelect(command.name)}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                      >
                        {command.name} - {command.description}
                      </button>
                    ))}
                  </div>
                )}
                <img
                  src="/assets/send.svg"
                  onClick={handleSendMessage}
                  className="send w-10 h-10 ml-2 cursor-pointer"
                  style={{ filter: whiteColorFilter }}
                  alt="Send"
                />
                <img
                  src="/assets/setting.svg"
                  onClick={() => setShowSettings(!showSettings)}
                  className="send w-10 h-10 ml-2 cursor-pointer"
                  style={{ filter: whiteColorFilter }}
                  alt="Settings"
                />
              </div>
            </>
          )}
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="flex flex-col items-center justify-center">
            <HamsterLoader />
            <p className="text-white font-bold text-xl mt-2">
              Be Patient, it might take 60 seconds
            </p>
          </div>
        </div>
      )}

      {showContactSelector && (
        <ContactSelector
          onSelect={handleContactSelect}
          onClose={() => setShowContactSelector(false)}
          imageDetails={selectedContact}
        />
      )}

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default Chat;
