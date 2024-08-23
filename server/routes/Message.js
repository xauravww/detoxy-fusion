import express from 'express';
import { sendMessage , getMessages} from '../controllers/messageController.js';

const router = express.Router();

// Route to save a new message
router.post('/', sendMessage);
// Route to get messages between 2 clients
router.get('/', getMessages);
export default router;
