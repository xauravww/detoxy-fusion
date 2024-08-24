import User from '../model/User.js'; // Import the User model

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
    // Find and delete user by ID
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
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

