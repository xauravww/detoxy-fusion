import mongoose from 'mongoose';

const { Schema } = mongoose;

const groupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  admins: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Group = mongoose.model('Group', groupSchema);

export default Group; 