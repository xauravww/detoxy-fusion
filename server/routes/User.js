import express from 'express';
import {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserByUsername
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

export default router;
