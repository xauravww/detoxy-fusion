import jwt from 'jsonwebtoken';
import User from '../model/User.js'; // Assuming you have a User model to fetch user details

const authorize = async (req, res, next) => {
  try {
    // Get the token from the headers
    const token = req.headers.authorization.split(' ')[1];

    // If no token is provided
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user by the id encoded in the token
    const user = await User.findById(decoded.id);

    // If the user doesn't exist
    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }

    // Attach user to the request object
    req.user = user;

    // Move to the next middleware/route handler
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authorize;
