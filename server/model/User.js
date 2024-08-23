import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
  },
  profilePicture: {
    type: String,
    default: 'default-profile-pic.png',
  },
  onlineStatus: {
    type: Boolean,
    default: false,
  },
  friendList: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  userPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isAI:{
    type: Boolean,
    default: false,
  }
});


userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
