import  { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Chats from './components/Chats';

import Login from './components/Login';
import Feed from './components/Feed';
import Navbar from './components/Navbar';
import Profile from './components/Profile';

const App = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user && JSON.parse(user).isLoggedIn) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      navigate('/login'); // Redirect to login if no user is logged in
    }
  }, [navigate]);

  return (
    <div className='bg-gradient-to-r from-gray-800 via-gray-900 to-black'>
      {isLoggedIn && <Navbar />}
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/chats' element={isLoggedIn ? <Chats /> : <Login />} />
        <Route path='/feed' element={isLoggedIn ? <Feed /> : <Login />} />
        <Route path='/:username' element={isLoggedIn ? <Profile /> : <Login />} />
        <Route path='/' element={<Login />} />
        <Route path='/*' element={isLoggedIn ? <Feed /> : <Login />} />
      </Routes>
    </div>
  );
};

export default App;
