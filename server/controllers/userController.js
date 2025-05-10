import User from '../model/User.js'; // Import the User model
import GeneratedImage from '../model/Posts.js';
import Message from '../model/Message.js';
import {jwtDecode} from 'jwt-decode';
import Group from '../model/Group.js';

export const createUser = async (req, res) => {
  try {
    const { name, email, profilePicture, onlineStatus, friendList, userPosts, username, token } = req.body;
    if (!name || !email || !username || !token) {
      return res.status(400).json({ error: 'Name, email, username, and token are required' });
    }

    // Decode JWT to get the 'sub' field
    const decodedToken = jwtDecode(token);
    const sub = decodedToken.sub;

    // Generate a password using the 'sub' and 'email'
    const generatedPassword = `${sub}${email}`;

    // Create new user
    const newUser = new User({
      name,
      email,
      profilePicture,
      onlineStatus,
      friendList,
      userPosts,
      username,
      password: generatedPassword,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a user by ID
export const getUserById = async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    // Retrieve all users
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a user by ID
export const updateUser = async (req, res) => {
  try {
    // Find and update user by ID
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a user by ID
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete posts associated with the user
    await GeneratedImage.deleteMany({ user: userId });

    // Delete messages where the user is either the sender or receiver
    await Message.deleteMany({ 
      $or: [
        { senderId: userId },
        { contactId: userId }
      ]
    });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User, associated posts, and messages deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a user by username
export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const toUserId = req.params.id;
    if (fromUserId === toUserId) {
      return res.status(400).json({ error: "You cannot send a friend request to yourself." });
    }
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ error: "User not found." });
    }
    if (toUser.friendRequests.includes(fromUserId) || toUser.friendList.includes(fromUserId)) {
      return res.status(400).json({ error: "Friend request already sent or already friends." });
    }
    toUser.friendRequests.push(fromUserId);
    await toUser.save();
    res.json({ message: "Friend request sent." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const fromUserId = req.params.id;
    const user = await User.findById(userId);
    const fromUser = await User.findById(fromUserId);
    if (!user || !fromUser) {
      return res.status(404).json({ error: "User not found." });
    }
    if (!user.friendRequests.includes(fromUserId)) {
      return res.status(400).json({ error: "No friend request from this user." });
    }
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== fromUserId);
    user.friendList.push(fromUserId);
    fromUser.friendList.push(userId);
    await user.save();
    await fromUser.save();
    res.json({ message: "Friend request accepted." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get friend list
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('friendList', 'username profilePicture');
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(user.friendList);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get pending friend requests
export const getFriendRequests = async (req, res) => {
  console.log("getFriendRequests called for user:", req.params.id);
  try {
    const user = await User.findById(req.params.id).populate('friendRequests', 'username profilePicture');
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(user.friendRequests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Block a user
export const blockUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const blockId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.blockedUsers.includes(blockId)) {
      user.blockedUsers.push(blockId);
      await user.save();
    }
    res.json({ message: 'User blocked' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Unblock a user
export const unblockUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const unblockId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== unblockId);
    await user.save();
    res.json({ message: 'User unblocked' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create a group
export const createGroup = async (req, res) => {
  try {
    const { name, members, admins } = req.body;
    if (!name || !members || !admins) {
      return res.status(400).json({ error: 'Name, members, and admins are required' });
    }
    const group = new Group({ name, members, admins });
    await group.save();
    res.status(201).json({ message: 'Group created', group });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Unfriend a user
export const unfriendUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const unfriendId = req.params.id;
    const user = await User.findById(userId);
    const unfriendUser = await User.findById(unfriendId);
    if (!user || !unfriendUser) return res.status(404).json({ error: 'User not found' });
    user.friendList = user.friendList.filter(id => id.toString() !== unfriendId);
    unfriendUser.friendList = unfriendUser.friendList.filter(id => id.toString() !== userId);
    await user.save();
    await unfriendUser.save();
    res.json({ message: 'User unfriended' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Search friends by username or name
export const getFriendsSearch = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('friendList', 'username name profilePicture');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const query = (req.query.query || '').toLowerCase().trim();
    if (!query) {
      return res.json(user.friendList);
    }
    const filtered = user.friendList.filter(friend =>
      (friend.username && friend.username.toLowerCase().includes(query)) ||
      (friend.name && friend.name.toLowerCase().includes(query))
    );
    res.json(filtered);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

