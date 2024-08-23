import express from 'express';
import { signUp, googleSignUp, signIn, googleSignIn } from '../controllers/authController.js';

const router = express.Router();

// Sign-Up Routes
router.post('/signup', signUp);
router.post('/google-signup', googleSignUp);

// Sign-In Routes
router.post('/signin', signIn);
router.post('/google-signin', googleSignIn);

export default router;
