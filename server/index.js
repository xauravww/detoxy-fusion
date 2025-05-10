import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import postRoutes from "./routes/Posts.js";
import userRoutes from "./routes/User.js";
import authRoutes from "./routes/Auth.js";
import generateRoutes from "./routes/Generate.js";
import messageRoutes from "./routes/Message.js";
import WebSocket, { WebSocketServer } from "ws";
import dotenv from "dotenv";
import path from "path";
import { pingJob, imageGenerationJob } from "./cron.js";
import http from "http"; // Import the HTTP module
import jwt from "jsonwebtoken";
import Group from "./model/Group.js";
import User from "./model/User.js";
import Message from "./model/Message.js";

dotenv.config({ path: path.resolve(".env") });

// Start the cron jobs
pingJob.start();
imageGenerationJob.start();

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error(`Error connecting to MongoDB: ${error}`));

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());

// Use routes
app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/generateImage", generateRoutes);
app.use("/api/message", messageRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the AI Image Generator API!");
});

// Create an HTTP server and attach the Express app to it
const server = http.createServer(app);

// WebSocket server setup on the same port as the Express server
const wss = new WebSocketServer({ server });
const onlineUsers = {}; // Track online users by their user IDs

wss.on("connection", function connection(ws) {
  let userId;

  ws.on("message", async function message(data, isBinary) {
    const parsedData = JSON.parse(data);

    if (parsedData.type === "register") {
      const { userId: incomingUserId, token } = parsedData;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id !== incomingUserId) {
          ws.close(4001, "User ID does not match token");
          return;
        }
        userId = incomingUserId;
        onlineUsers[userId] = ws; // Track this user as online
        await User.findByIdAndUpdate(userId, { onlineStatus: true });
        broadcastOnlineUsers();
      } catch (err) {
        ws.close(4000, "Invalid or expired token");
        return;
      }
    } else if (parsedData.type === "message" || parsedData.type === "image") {
      const {
        senderId,
        id,
        contactId,
        text,
        imageUrl,
        settings,
        prompt,
        username,
      } = parsedData;

      // Blocked user logic
      const contactUser = await User.findById(contactId);
      if (contactUser && contactUser.blockedUsers.includes(senderId)) {
        // Don't deliver message if sender is blocked
        return;
      }

      if (contactId && onlineUsers[contactId] && contactId != senderId) {
        onlineUsers[contactId].send(
          JSON.stringify({
            type: "message",
            senderId,
            id,
            contactId,
            text,
            imageUrl,
            settings,
            prompt,
            username,
          })
        );
      }
      // Save the message to the database (optional)
      // await Message.create({ senderId, contactId, text, imageUrl, settings, prompt, username, id, type: parsedData.type });
    } else if (parsedData.type === "typing") {
      // Typing indicator
      const { senderId, contactId } = parsedData;
      if (contactId && onlineUsers[contactId]) {
        onlineUsers[contactId].send(
          JSON.stringify({ type: "typing", senderId, contactId })
        );
      }
    } else if (parsedData.type === "read") {
      // Read receipt
      const { messageId, readerId } = parsedData;
      await Message.findOneAndUpdate({ id: messageId }, { $addToSet: { readBy: readerId } });
      // Optionally notify sender
      // ...
    } else if (parsedData.type === "group-message") {
      // Group chat message
      const { groupId, senderId, text, imageUrl, fileUrl, settings, prompt, username } = parsedData;
      const group = await Group.findById(groupId);
      if (group) {
        for (const memberId of group.members) {
          if (memberId.toString() !== senderId && onlineUsers[memberId]) {
            onlineUsers[memberId].send(
              JSON.stringify({
                type: "group-message",
                groupId,
                senderId,
                text,
                imageUrl,
                fileUrl,
                settings,
                prompt,
                username,
              })
            );
          }
        }
      }
      // Save group message to DB (optional)
      // await Message.create({ groupId, senderId, text, imageUrl, fileUrl, settings, prompt, username, type: 'group-message' });
    }
  });

  ws.on("close", async () => {
    if (userId) {
      delete onlineUsers[userId]; // Remove this user from online users
      await User.findByIdAndUpdate(userId, { onlineStatus: false, lastSeen: new Date() });
      broadcastOnlineUsers();
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

function broadcastOnlineUsers() {
  const message = JSON.stringify({
    type: "onlineUsers",
    users: Object.keys(onlineUsers),
  });

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}!`);
});
