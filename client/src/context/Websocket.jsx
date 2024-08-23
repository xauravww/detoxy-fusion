
import  { createContext, useState, useEffect, useRef, useCallback } from "react";

// Create a context for WebSocket
export const webSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({}); 
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const connect = () => {
      socketRef.current = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);

      socketRef.current.onopen = () => {
        // console.log("Connected to WebSocket server");
        setIsConnected(true);

        
        const userId = JSON.parse(localStorage.getItem("user"))?.id; 
        // console.log("sending this userid " + userId);
        if (userId) {
          socketRef.current.send(JSON.stringify({ type: "register", userId }));
        }
      };

      socketRef.current.onclose = () => {
        console.log("Disconnected from WebSocket server");
        setIsConnected(false);
        // Attempt reconnection after a delay
        setTimeout(connect, 5000);
      };

      socketRef.current.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        console.log("Message from server:", messageData);

        if (messageData.type === "onlineUsers") {
          const updatedUsers = messageData.users.reduce((acc, userId) => {
            acc[userId] = true; // Mark user as online
            return acc;
          }, {});
          setOnlineUsers(updatedUsers);
        }

        if (messageData.type === "message" || messageData.type == "image") {
          // Handle incoming messages
          console.log(`Message from ${messageData.senderId}: ${messageData.text}`);

          console.log("getting imageurl in frontend after wsl broadcast "+messageData.imageUrl)
        
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              senderId: messageData.senderId,
              text: messageData.text,
              id: messageData.id,
              contactId: messageData.contactId,
              imageUrl: messageData.imageUrl,
              settings:messageData.settings,
              prompt:messageData.prompt
            }
          ]);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendMessage = useCallback((message) => {
    if (isConnected && socketRef.current) {
      socketRef.current.send(JSON.stringify({ type: "message", ...message }));
    }
  }, [isConnected]);

  return (
    <webSocketContext.Provider value={{ sendMessage, isConnected, onlineUsers, messages,setMessages }}>
      {children}
    </webSocketContext.Provider>
  );
};
