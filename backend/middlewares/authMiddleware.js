const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.activeSessionToken !== token) {
      return res.status(401).json({ msg: 'Invalid session' });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ msg: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
