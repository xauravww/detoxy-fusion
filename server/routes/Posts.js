import express from 'express';
import {
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
} from '../controllers/postController.js';

const router = express.Router();

// Route to create a new post
router.post('/', createPost);

// Route to get a post by ID
router.get('/:id', getPostById);

// Route to get all posts
router.get('/', getAllPosts);

// Route to update a post by ID
router.put('/:id', updatePost);

// Route to delete a post by ID
router.delete('/:id', deletePost);

export default router;
