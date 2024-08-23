
import { Link, useNavigate } from "react-router-dom"; 
const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
 
    localStorage.removeItem("user");

 
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md h-[11vh] lg:h-[10vh]  z-[3] flex flex-col justify-center">
      <div className="container mx-auto flex items-center justify-between">
        <img src="/assets/detoxyfuse1.jpg" className="send w-12 h-12 rounded-full ml-4" />
        <div className="flex space-x-6">
          <Link
            to="/feed"
            className="hover:text-gray-400 transition-colors duration-300"
          >
            Feed
          </Link>
          <Link
            to="/chats"
            className="hover:text-gray-400 transition-colors duration-300"
          >
            Chats
          </Link>
          <Link
            to="/profile"
            className="hover:text-gray-400 transition-colors duration-300"
          >
            Profile
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="bg-gray-800 text-white py-2 px-4 rounded-full hover:bg-gray-700 transition-colors duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
