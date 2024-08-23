import GeneratedImage from '../model/Posts.js'; // Import the GeneratedImage model

// Create a new post
export const createPost = async (req, res) => {
  try {
    // Validate request body
    const { url, prompt, user, settings } = req.body;
    console.log(req.body)
    if (!url || !prompt || !user || !settings || !settings.model) {
      return res.status(400).json({ error: 'URL, prompt, user, and settings (including model) are required' });
    }

    // Create new post
    const newPost = new GeneratedImage({
      url,
      prompt,
      user,
      settings,
    });

    // Save post to database
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a post by ID
export const getPostById = async (req, res) => {
  try {
    // Find post by ID
    const post = await GeneratedImage.findById(req.params.id).populate('user', 'name email');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    // Retrieve all posts
    const posts = await GeneratedImage.find().populate('user', 'name email profilePicture');
    res.json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a post by ID
export const updatePost = async (req, res) => {
  try {
    // Find and update post by ID
    const post = await GeneratedImage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a post by ID
export const deletePost = async (req, res) => {
  try {
    // Find and delete post by ID
    const post = await GeneratedImage.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
