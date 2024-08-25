
import axios from 'axios';


const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/auth/`;

// Sign Up with Email and Password
export const emailSignUp = async (name, email, password, profilePicture, username) => {
  try {
    const response = await axios.post(`${API_URL}signup`, {
      name,
      email,
      password,
      profilePicture,
      username,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to sign up');
  }
};

// Sign In with Email and Password
export const emailSignIn = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}signin`, { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to sign in');
  }
};

// Sign Up with Google
export const googleSignUp = async (googleToken) => {
  try {
    const response = await axios.post(`${API_URL}google-signup`, { token: googleToken });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to sign up with Google');
  }
};

// Sign In with Google
export const googleSignIn = async (googleToken) => {
  try {
    const response = await axios.post(`${API_URL}google-signin`, { token: googleToken });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to sign in with Google');
  }
};


// Forgot Password
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/forgot`, { email });
    return response.data;
  } catch (error) {
    console.error('Error sending forgot password request:', error);
    throw error;
  }
};

// Reset Password
export const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(`${API_URL}/reset/${token}`, { password });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};