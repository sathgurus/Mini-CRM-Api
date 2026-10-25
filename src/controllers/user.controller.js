const User = require('../models/User');


const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role').sort('name');
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

module.exports = { listUsers };