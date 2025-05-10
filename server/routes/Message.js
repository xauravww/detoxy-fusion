import express from 'express';
import { sendMessage , getMessages, uploadFile } from '../controllers/messageController.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// Route to save a new message
router.post('/', authorize, sendMessage);
// Route to get messages between 2 clients
router.get('/', authorize,getMessages);
// Route to upload a file/image
router.post('/upload', authorize, uploadFile);
export default router;

