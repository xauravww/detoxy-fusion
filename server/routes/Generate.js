import express from 'express';
import { generateImage } from '../controllers/generativeController.js';

const router = express.Router();

// Sign-Up Routes
router.post('/', generateImage);

export default router;
