import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import fallbackPic from '../../public/assets/anonymous.svg'; 
import axios from 'axios';
import { toast } from 'react-toastify';
import HamsterLoader from './Loader/HamsterLoader';
import FriendModal from './FriendModal';

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
  const [currentUserId, setCurrentUserId] = useState(JSON.parse(localStorage.getItem("user")).user._id); 
  const {username} = useParams()
  const [friendStatus, setFriendStatus] = useState(''); // '', 'friends', 'pending', 'requested', 'self'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', username: '', profilePicture: '' });
  const [isFriendModalOpen, setFriendModalOpen] = useState(false);

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
          id:data._id || ''
        });
        setEditForm({ name: data.name, username: data.username, profilePicture: data.profilePicture || '' });
        // Determine friend status
        const currentUserId = JSON.parse(localStorage.getItem("user")).user._id;
        if (data._id === currentUserId) {
          setFriendStatus('self');
        } else if (data.friendList && data.friendList.includes(currentUserId)) {
          setFriendStatus('friends');
        } else {
          // Check if pending request
          const requestsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/${data._id}/requests`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}` }
          });
          const pending = requestsRes.data.map(u => u._id);
          if (pending.includes(currentUserId)) {
            setFriendStatus('pending');
          } else {
            // Check if user has received a request from this profile
            const myRequestsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/${currentUserId}/requests`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}` }
            });
            const requested = myRequestsRes.data.map(u => u._id);
            if (requested.includes(data._id)) {
              setFriendStatus('requested');
            } else {
              setFriendStatus('');
            }
          }
        }
        // If viewing own profile, fetch pending requests
        if (data._id === currentUserId) {
          const myRequestsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/${currentUserId}/requests`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}` }
          });
          setPendingRequests(myRequestsRes.data);
        }
      } catch (error) {
        setError(error.message); 
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username]);

  const handleDeleteAccount = async () => {
    console.log('Account deleted');
    const id  = JSON.parse(localStorage.getItem("user")).user._id 
    const response = await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
        },
      }
    );

    if(response.status === 200){
      alert('Account deleted successfully');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/${profile.id}/friend-request`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}` }
      });
      toast.success('Friend request sent!');
      setFriendStatus('pending');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send friend request');
    }
  };

  const handleAcceptFriendRequest = async (fromUserId) => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/${fromUserId}/accept-friend`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}` }
      });
      toast.success('Friend request accepted!');
      setPendingRequests(pendingRequests.filter(u => u._id !== fromUserId));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept friend request');
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const id = JSON.parse(localStorage.getItem("user")).user._id;
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${id}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
          },
        }
      );
      setProfile({ ...profile, ...editForm });
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-13vh)] md:min-h-[calc(100vh-13vh)] lg:min-h-[calc(100vh-12vh)] text-white"><HamsterLoader /></div>;
  }

  if (error) {
    if (error.toLowerCase().includes('404')) {
      return <div className="flex justify-center items-center min-h-[calc(100vh-13vh)] md:min-h-[calc(100vh-13vh)] lg:min-h-[calc(100vh-12vh)] text-white">User not found.</div>;
    }
    return <div className="flex justify-center items-center min-h-[calc(100vh-13vh)] md:min-h-[calc(100vh-13vh)] lg:min-h-[calc(100vh-12vh)] text-white">Error: {error}</div>;
  }

  return (
    <div className="fixed top-[13vh] lg:top-[12vh] left-0 w-full h-[calc(100vh-13vh)] lg:h-[calc(100vh-12vh)] bg-gradient-to-r from-gray-800 via-gray-900 to-black overflow-hidden z-40 flex flex-col items-center justify-center">
      <div className="flex-1 overflow-y-auto w-full flex justify-center">
        <div className="flex flex-col items-center p-6 bg-gray-800 bg-opacity-80 rounded-lg shadow-lg w-4/5 md:w-1/2 mt-8 mb-8">
          <div className="relative mb-4">
            <img
              src={profile.profilePicture}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              onError={(e) => { e.target.src = fallbackPic; }}
            />
          </div>
          {editing ? (
            <form onSubmit={handleEditSubmit} className="flex flex-col items-center w-full mb-4">
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                placeholder="Name"
                className="mb-2 p-2 rounded bg-white text-black outline-none w-full"
                required
              />
              <input
                type="text"
                name="username"
                value={editForm.username}
                onChange={handleEditChange}
                placeholder="Username"
                className="mb-2 p-2 rounded bg-white text-black outline-none w-full"
                required
              />
              <input
                type="text"
                name="profilePicture"
                value={editForm.profilePicture}
                onChange={handleEditChange}
                placeholder="Profile Picture URL"
                className="mb-2 p-2 rounded bg-white text-black outline-none w-full"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-400 transition-colors duration-300">Save</button>
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-400 transition-colors duration-300">Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-4">{profile.name}</h1>
              <p className="text-lg mb-2">{profile.email}</p>
              {profile.id && profile.id === currentUserId && (
                <button
                  onClick={() => setEditing(true)}
                  className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-400 transition-colors duration-300"
                >
                  Edit Profile
                </button>
              )}
            </>
          )}

         

         

     {profile.id && profile.id==currentUserId && (
      <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-400 transition-colors duration-300"
          >
            Delete Account
          </button>
     )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
