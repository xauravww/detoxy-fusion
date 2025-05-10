import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode'; // Corrected import for jwt-decode
import logo from '../../public/assets/image.png'; // Update path if necessary
import { googleSignUp, googleSignIn, emailSignUp, emailSignIn } from '../services/authService.js'; // Import the API services
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profilePicture: '',
    username: '',
  });
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.isLoggedIn) {
      navigate('/feed');
    }
  }, [navigate]);
  const handleGoogleSuccess = async (response) => {
    try {
      const decoded = jwtDecode(response.credential);
      const { name, email, picture, sub } = decoded;
    
      const userData = {
        name,
        email,
        profilePicture: picture,
        googleId: sub,
      };
    
      let user;
    
      try {
        // Try to sign in the user first
        user = await googleSignIn(response.credential);
      } catch (error) {
        if (error.message.includes('User not found')) {
          // If user is not found, sign them up and then sign in
          await googleSignUp(response.credential);
          user = await googleSignIn(response.credential);
        } else {
          // Handle other errors
          throw error;
        }
      }
    
      // Save JWT token and user data to localStorage
      localStorage.setItem('JWT_TOKEN', user.token  || user.token_JWT); // Store the JWT token
      localStorage.setItem('user', JSON.stringify({
        isLoggedIn: true,
        ...userData,
        id: user.user._id, 
        user: user.user
      }));
    
      navigate('/feed');
    } catch (error) {
      console.error("Error handling Google login:", error);
      toast.error("An error occurred during Google login. Please try again.");
    }
  };
  
  

  const handleGoogleError = (err) => {
    console.error("Google login failed");
    toast.error(err);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, profilePicture, username } = formData;
  
    try {
      let user;
      if (isSignUp) {
        user = await emailSignUp(name, email, password, profilePicture, username);
      } else {
        user = await emailSignIn(email, password);
      }
  
      // Save JWT token and user data to localStorage
      localStorage.setItem('JWT_TOKEN', user.token || user.token_JWT); // Store the JWT token
      localStorage.setItem('user', JSON.stringify({
        isLoggedIn: true,
        ...formData,
        id:user.user._id, 
        user: user.user
      }));
  
      navigate('/feed');
    } catch (error) {
      console.error(`Error during ${isSignUp ? 'sign-up' : 'sign-in'}:`, error);
      toast.error(`Failed to ${isSignUp ? 'sign up' : 'sign in'}. Please try again.`);
    }
  };
  

  const handleGuestLogin = () => {
    localStorage.setItem('user', JSON.stringify({ isLoggedIn: true }));
    navigate('/feed');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="flex flex-col justify-center items-center p-6 bg-gray-800 bg-opacity-80 rounded-lg shadow-lg">
        {/* <img src={logo} alt="logo" className="mb-4 w-32" /> */}
        <h1 className="text-3xl font-bold text-white mb-6">{isSignUp ? 'Sign Up' : 'Login'}</h1>
       
        {isSignUp ? (
          <form onSubmit={handleFormSubmit} className="flex flex-col w-full max-w-sm">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Name"
              className="mb-2 p-2 rounded bg-white text-black outline-none"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              placeholder="Email"
              className="mb-2 p-2 rounded bg-white text-black outline-none"
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              placeholder="Password"
              className="mb-2 p-2 rounded bg-white text-black outline-none"
              required
            />
            <input
              type="text"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleFormChange}
              placeholder="Profile Picture URL (optional)"
              className="mb-2 p-2 rounded bg-white text-black outline-none"
            />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleFormChange}
              placeholder="Username"
              className="mb-2 p-2 rounded bg-white text-black outline-none"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-400 transition-colors duration-300"
            >
              Sign Up
            </button>
          </form>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex flex-col w-full max-w-sm">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              placeholder="Email"
              className="mb-2 p-2 rounded bg-white text-black outline-none"
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              placeholder="Password"
              className="mb-2 p-2 rounded bg-white text-black outline-none"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-400 transition-colors duration-300"
            >
              Sign In
            </button>
          </form>
        )}

        <div className="mb-4 mt-4">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_REACT_APP_GOOGLE_API_TOKEN}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              size="large"
              text="Sign in with Google"
              shape="square"
              width="12px"
              className="bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-300"
            />
          </GoogleOAuthProvider>
        </div>
        <div className='flex flex-col justify-center items-center mb-4 text-gray-400'>
          <div
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#dadada]  cursor-pointer"
          >
            {isSignUp ? 'Switch to Login' : 'Switch to Sign Up'}
          </div>
          {/* ---------or---------  */}
          <div
            onClick={()=>navigate("/forgot")}
            className="text-[#dadada]  cursor-pointer"
          >
            {/* Guest Login coming soon */}
            Forgot Password ?
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
