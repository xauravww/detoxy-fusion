import express from 'express';
import {
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// Route to create a new post
router.post('/', authorize, createPost);

// Route to get a post by ID
router.get('/:id', getPostById);

// Route to get all posts
router.get('/', getAllPosts);

// Route to update a post by ID
router.put('/:id',authorize, updatePost);

// Route to delete a post by ID
router.delete('/:id',authorize, deletePost);



export default router;
