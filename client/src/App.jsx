import { useContext, useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Chats from './components/Chats';
import Login from './components/Login';
import Feed from './components/Feed';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import { sidebarContext } from './context/Sidebar';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(null); 
  const {setSelectedChat} = useContext(sidebarContext)

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user && JSON.parse(user).isLoggedIn) {
      setIsLoggedIn(true);
      
    } else {
      setIsLoggedIn(false);
      if (location.pathname !== '/login') {
        navigate('/login'); // Redirect to login if no user is logged in
      }
    }

  }, [navigate, location.pathname]);


  useEffect(()=>{
    if(localStorage.getItem('user')!=null ){
      setSelectedChat(
        {
          id: JSON.parse(localStorage.getItem("user"))?.user?._id || "guest_id",
          name: JSON.parse(localStorage.getItem("user"))?.user?.username || "guest_username",
          status: "Active now",
          bgColor: "bg-gradient-to-r from-indigo-500 to-purple-500",
          isAI: true,
          profilePicture: JSON.parse(localStorage.getItem("user"))?.user?.profilePicture || "/assets/anonymous.svg",
        }
      )
    }
  },[isLoggedIn])

  // Handle the loading state while checking if the user is logged in
  if (isLoggedIn === null) {
    return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
  }

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
