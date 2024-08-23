import User from '../model/User.js';
import {jwtDecode} from 'jwt-decode';

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
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Google OAuth Sign-Up
export const googleSignUp = async (req, res) => {
  try {
    const { token } = req.body;
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
    });

    await newUser.save();
    res.status(201).json(newUser);
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

    res.status(200).json({ message: 'Sign-in successful', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Google OAuth Sign-In
export const googleSignIn = async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = jwtDecode(token);

    const { email } = decodedToken;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found, please sign up' });
    }

    res.status(200).json({ message: 'Google sign-in successful', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
