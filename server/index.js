import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import postRoutes from './routes/Posts.js';
import userRoutes from './routes/User.js';
import authRoutes from './routes/Auth.js';
import generateRoutes from './routes/Generate.js';
import messageRoutes from './routes/Message.js';
import WebSocket, { WebSocketServer } from 'ws';
import axios from 'axios';
import dotenv from 'dotenv'
import path from 'path';

dotenv.config({path: path.resolve('.env')});
// WebSocket server setup
const wss = new WebSocketServer({ port: process.env.WEBSOCKET_PORT });
const onlineUsers = {}; // Track online users by their user IDs

wss.on('connection', function connection(ws) {
  console.log('Client connected');
  
  let userId;

  // Listen for messages from clients
  ws.on('message', function message(data, isBinary) {
    const parsedData = JSON.parse(data);

    if (parsedData.type === 'register') {
      userId = parsedData.userId;
      onlineUsers[userId] = ws; // Track this user as online
      broadcastOnlineUsers();
    } else if (parsedData.type === 'message' || parsedData.type === 'image') {
      const { senderId, id, contactId, text ,imageUrl,settings ,prompt , username } = parsedData;

      // Construct the message payload
      const message = JSON.stringify({ type: 'message', senderId, text });

      if (contactId && onlineUsers[contactId] && contactId!=senderId) {
        // Send message to specific recipient
        console.log("getting imageurl in backend before unicasting "+JSON.stringify(senderId, id, contactId, text ,imageUrl,settings ,prompt,username))
        onlineUsers[contactId].send(JSON.stringify({type: 'message',senderId, id, contactId, text ,imageUrl,settings ,prompt,username}));
      } else {
        // Broadcast the message to all clients except the sender
        for (const [clientId, client] of Object.entries(onlineUsers)) {
          if (clientId !== senderId && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        }
      }

      // Save the message to the database
      // Implement message saving logic here
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    if (userId) {
      delete onlineUsers[userId]; // Remove this user from online users
      broadcastOnlineUsers();
    }
  });

  // Handle errors
  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
});

// Function to broadcast the list of online users
function broadcastOnlineUsers() {
  const message = JSON.stringify({
    type: 'onlineUsers',
    users: Object.keys(onlineUsers)
  });

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// MongoDB connection
const mongoURI = process.env.MONGODB_URI; 
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error(`Error connecting to MongoDB: ${error}`));

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());

// Use routes
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/generateImage', generateRoutes);
app.use('/api/message', messageRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the AI Image Generator API!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}!`);
});
