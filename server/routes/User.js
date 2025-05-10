import express from 'express';
import {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserByUsername,
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  getFriendRequests,
  blockUser,
  unblockUser,
  createGroup,
  unfriendUser,
  getFriendsSearch
} from '../controllers/userController.js';
import authorize from '../middleware/authorize.js';



const router = express.Router();

// Route to create a new user
router.post('/', createUser);

// Route to get a user by ID
router.get('/:id', getUserById);
router.get('/profile/:username', getUserByUsername);

// Route to get all users
router.get('/', getAllUsers);

// Route to update a user by ID
router.put('/:id',authorize, updateUser);

// Route to delete a user by ID
router.delete('/:id',authorize, deleteUser);

// Friend system routes
router.post('/:id/friend-request', authorize, sendFriendRequest);
router.post('/:id/accept-friend', authorize, acceptFriendRequest);
router.get('/:id/friends', authorize, getFriends);
router.get('/:id/requests', authorize, getFriendRequests);

// Block/unblock user routes
router.post('/:id/block', authorize, blockUser);
router.post('/:id/unblock', authorize, unblockUser);

// Group creation route
router.post('/group', authorize, createGroup);

// Unfriend user route
router.post('/:id/unfriend', authorize, unfriendUser);

// Friend search route
router.get('/:id/friends/search', authorize, getFriendsSearch);

export default router;
