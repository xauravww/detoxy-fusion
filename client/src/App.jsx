import { useContext, useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Chats from './components/Chats';
import Login from './components/Login';
import Feed from './components/Feed';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import { sidebarContext } from './context/Sidebar';
import ForgotOrResetPassword from './components/ForgotOrResetPassword';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HamsterLoader from './components/Loader/HamsterLoader';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(null); 
  const { setSelectedChat } = useContext(sidebarContext);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.isLoggedIn) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      if (location.pathname !== '/login' && location.pathname !== '/forgot') {
        navigate('/login'); // Redirect to login if no user is logged in
      }
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (isLoggedIn) {
      const user = JSON.parse(localStorage.getItem('user'));
      setSelectedChat({
        id: user?.user?._id || 'guest_id',
        name: user?.user?.username || 'guest_username',
        status: 'Active now',
        bgColor: 'bg-gradient-to-r from-indigo-500 to-purple-500',
        isAI: true,
        profilePicture: user?.user?.profilePicture || '/assets/anonymous.svg',
      });
    }
  }, [isLoggedIn, setSelectedChat]);

  // Handle the loading state while checking if the user is logged in
  if (isLoggedIn === null) {
    return <div className="flex justify-center items-center text-white h-screen"><HamsterLoader /></div>;
  }

  return (
    <div className='bg-gradient-to-r from-gray-800 via-gray-900 to-black min-h-screen'>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      {isLoggedIn && <Navbar />}
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/chats' element={isLoggedIn ? <Chats /> : <Login />} />
        <Route path='/feed' element={isLoggedIn ? <Feed /> : <Login />} />
        <Route path='/:username' element={isLoggedIn ? <Profile /> : <Login />} />
        <Route path='/forgot' element={<ForgotOrResetPassword />} />
        <Route path='/' element={isLoggedIn ? <Feed /> : <Login />} />
        <Route path='/*' element={isLoggedIn ? <Feed /> : <Login />} />
      </Routes>
    </div>
  );
};

export default App;
