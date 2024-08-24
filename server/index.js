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

  ws.on("message", function message(data, isBinary) {
    const parsedData = JSON.parse(data);

    if (parsedData.type === "register") {
      userId = parsedData.userId;
      onlineUsers[userId] = ws; // Track this user as online
      broadcastOnlineUsers();
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
      } else {
        for (const [clientId, client] of Object.entries(onlineUsers)) {
          if (clientId !== senderId && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ type: "message", senderId, text })
            );
          }
        }
      }

      // Save the message to the database
      // Implement message saving logic here
    }
  });

  ws.on("close", () => {
    if (userId) {
      delete onlineUsers[userId]; // Remove this user from online users
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
