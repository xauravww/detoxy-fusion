import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');
const { Schema } = mongoose;


const generatedImageSchema = new Schema({
  url: {
    type: String,
    required: true,
    trim: true,
  },
  prompt: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  settings: {
    model: {
      type: String,
    
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  username: {
    type: String,
    required: true,
  },
});


const Post = mongoose.model('GeneratedImage', generatedImageSchema);

export default Post;
