
import Message from '../model/Message.js';

// Function to handle sending a new message
export const sendMessage = async (req, res) => {
  try {
    const { text, senderId, id, contactId, type ,imageUrl ,username ,settings } = req.body;

    // Create a new message
    console.log("getting type "+type);
    const newMessage = new Message({
      type,
      text,
      senderId,
      id,
      contactId,
      imageUrl,
      username,
      settings
    });

    // Save the message to the database
    await newMessage.save();

    res.status(201).json({ message: 'Message sent successfully', newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to handle retrieving messages
export const getMessages = async (req, res) => {
  try {
    const { senderId, contactId } = req.query;

    // Fetch messages from the database based on senderId and contactId
    const messages = await Message.find({
      $or: [
        { senderId, contactId },
        { senderId: contactId, contactId: senderId }, // To get messages from both sides
      ],
    }).sort({ createdAt: 1 }); // Sort by creation time in ascending order

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
