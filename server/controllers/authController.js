import User from '../model/User.js';
import {jwtDecode} from 'jwt-decode';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

// Helper function to create a JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Traditional Sign-Up
export const signUp = async (req, res) => {
  try {
    const { name, email, password, username, profilePicture } = req.body;
    if (!name || !email || !password || !username) {
      return res.status(400).json({ error: 'Name, email, password, and username are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const newUser = new User({
      name,
      email,
      password, // This will be hashed automatically by the pre-save hook
      username,
      profilePicture,
      isGoogleAccount: false,
    });

    await newUser.save();

    // Generate a token for the new user
    const token = createToken(newUser._id);

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Google OAuth Sign-Up
export const googleSignUp = async (req, res) => {
  try {
    const token = req.body.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({ error: 'Token is required for Google Sign-Up' });
    }

    const decodedToken = jwtDecode(token);

    const { name, email, sub, picture: profilePicture } = decodedToken;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const generatedPassword = `${sub}${email}`;

    const newUser = new User({
      name,
      email,
      password: generatedPassword,
      username: email.split('@')[0], // Default username if not provided
      profilePicture,
      isGoogleAccount: true,
    });

    await newUser.save();

    // Generate a token for the new user
    const token_JWT = createToken(newUser._id);

    res.status(201).json({ user: newUser, token_JWT });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Traditional Sign-In
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate a token for the authenticated user
    const token = createToken(user._id);

    res.status(200).json({ message: 'Sign-in successful', user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Google OAuth Sign-In
export const googleSignIn = async (req, res) => {
  try {
    const token = req.body.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({ error: 'Token is required for Google Sign-In' });
    }

    const decodedToken = jwtDecode(token);

    const { email } = decodedToken;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found, please sign up' });
    }

    // Generate a token for the authenticated user
    const token_JWT = createToken(user._id);

    res.status(200).json({ message: 'Google sign-in successful', user, token_JWT });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isGoogleAccount) {
      return res.status(400).json({ error: 'Password reset is not available for Google accounts. Please use Google login.' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const message = `Your reset password token is:\n\n${resetToken}\n\nIf you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message,
      });

      res.status(200).json({
        success: true,
        message: 'Email sent',
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ error: err.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  // Hash the token sent in the URL
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid token or token expired' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Generate a token for the user after password reset
    const token = createToken(user._id);

    res.status(200).json({ success: true, message: 'Password updated successfully', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
