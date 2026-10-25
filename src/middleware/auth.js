const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');


const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'Not authenticated. Please log in.');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      throw new ApiError(401, 'Invalid or expired token. Please log in again.');
    }

    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(401, 'User no longer exists.');

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};


const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return next(new ApiError(403, 'You do not have permission to do this.'));
  next();
};


module.exports = { protect, authorize };