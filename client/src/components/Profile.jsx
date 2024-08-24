import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import fallbackPic from '../../public/assets/anonymous.svg'; 

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePicture: fallbackPic,
    friends: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const {username} = useParams()
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null); // Reset error state on new fetch
      try {
        console.log('Fetching profile data...');
        
    
        if (!username) {
          throw new Error('No username found in params');
        }

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile/${username}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        setProfile({
          name: data.name,
          email: data.email,
          profilePicture: data.profilePicture || fallbackPic,
          friends: data.friendList || [],
        });
      } catch (error) {
        setError(error.message); 
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username]);

  const handleDeleteAccount = () => {
    console.log('Account deleted');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFriendRequest = (friendName) => {
    console.log(`Friend request sent to ${friendName}`);
    // Add functionality for friend request here
    //i will add it in future versions
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-white">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center h-screen bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white">
      <div className="flex flex-col items-center p-6 bg-gray-800 bg-opacity-80 rounded-lg shadow-lg mt-8 w-4/5 md:w-1/2">
        <div className="relative mb-4">
          <img
            src={profile.profilePicture}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
            onError={(e) => { e.target.src = fallbackPic; }}
          />
        </div>
        <h1 className="text-3xl font-bold mb-4">{profile.name}</h1>
        <p className="text-lg mb-2">{profile.email}</p>

        <div className="mb-4 w-full">
          <h2 className="text-xl font-semibold mb-2">Friends</h2>
          <ul className="list-disc list-inside mb-4">
            {profile.friends.length > 0 ? (
              profile.friends.map((friend, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{friend}</span>
                  <button
                    onClick={() => handleFriendRequest(friend)}
                    className="ml-4 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors duration-300"
                  >
                    Add Friend
                  </button>
                </li>
              ))
            ) : (
              <p>No friends yet.</p>
            )}
          </ul>
        </div>

        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-400 transition-colors duration-300"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Profile;
