const User = require('../models/User');

/**
 * Middleware: attachUserRole
 * Must run AFTER verifyFirebaseToken (req.user.uid must exist).
 * Fetches the MongoDB user record and attaches role + storeName to req.user.
 */
module.exports = async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid }).lean();
    if (!user) {
      return res.status(403).json({ message: 'User profile not found in database' });
    }
    req.user.role      = user.role;
    req.user.storeName = user.storeName || null;
    req.user.dbId      = user._id;
    next();
  } catch (err) {
    console.error('[attachUserRole]', err.message);
    return res.status(500).json({ message: 'Server error while loading user profile' });
  }
};
