import mongoose from 'mongoose';

const { Schema } = mongoose;


const messageSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    unique: true,
    required: true,
  },
  contactId: {
    type: String,
    required: true,
  },
  imageUrl:{
    type: String,
    default: null,
  },
  fileUrl: {
    type: String,
    default: null,
  },
  type:{
    type: String,
    required: true,
  },
 username: {
    type: String,
    required: true,
  },
  settings: {
    model: {
      type: String,
    },
    prompt: {
        type: String,
      },
  },
  readBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  groupId: {
    type: String,
    default: null,
  },
}, {
  timestamps: true, 
});

// Create the model
const Message = mongoose.model('Message', messageSchema);

export default Message;
