// ForgotOrResetPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../services/authService'; // Import the API services

const ForgotOrResetPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setMessage('Password reset email sent successfully. Please check your inbox.');
      setError('');
      setIsResetMode(true); // Switch to reset mode after email is sent
    } catch (err) {
      setMessage('');
      setError('Failed to send password reset email. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await resetPassword(token, password);
      console.log(response);
      if (response.success) {
        const { token: newToken } = response; // Destructure the token from the response
        
        // Save JWT token to localStorage
        localStorage.setItem('JWT_TOKEN', newToken);
        
        setMessage('Password updated successfully.');
        setError('');
        
        navigate('/'); // Navigate to home page
      } else {
        // Handle case where success is false but no error was thrown
        setMessage(response.data.message);
        setError('');
      }
    } catch (err) {
      setMessage('');
      setError('An error occurred: ' + (err.response?.data?.message || err.message)); // Handle error more gracefully
    }
  };
  

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="flex flex-col justify-center items-center p-6 bg-gray-800 bg-opacity-80 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6">
          {isResetMode ? 'Reset Password' : 'Forgot Password'}
        </h1>

        {!isResetMode ? (
          <form onSubmit={handleForgotPassword} className="flex flex-col w-full max-w-sm">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mb-2 p-2 rounded bg-white text-black outline-none"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-400 transition-colors duration-300"
            >
              Send Reset Link
            </button>
            {message && <p className="mt-4 text-green-500">{message}</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col w-full max-w-sm">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter reset token"
              className="mb-2 p-2 rounded bg-white text-black outline-none"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="mb-2 p-2 rounded bg-white text-black outline-none"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-400 transition-colors duration-300"
            >
              Reset Password
            </button>
            {message && <p className="mt-4 text-green-500">{message}</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotOrResetPassword;
