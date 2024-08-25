import express from 'express';
import { signUp, googleSignUp, signIn, googleSignIn ,forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// Sign-Up Routes
router.post('/signup', signUp);
router.post('/google-signup', googleSignUp);

// Sign-In Routes
router.post('/signin', signIn);
router.post('/google-signin', googleSignIn);
router.post('/forgot', forgotPassword);
router.post('/reset/:token', resetPassword);



export default router;
