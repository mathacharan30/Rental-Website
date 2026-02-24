const User  = require('../models/User');
const Store = require('../models/Store');

/**
 * Middleware: attachUserRole
 * Must run AFTER verifyFirebaseToken (req.user.uid must exist).
 * Fetches the MongoDB user record and attaches role + storeName + storeId to req.user.
 * Self-heals: if storeId is missing but storeName exists, resolves it from the Store
 * collection and patches the User document so subsequent calls are instant.
 */
module.exports = async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(403).json({ message: 'User profile not found in database' });
    }

    req.user.role      = user.role;
    req.user.storeName = user.storeName || null;
    req.user.storeId   = user.storeId   || null;
    req.user.dbId      = user._id;

    console.log(`[attachUserRole] uid=${req.user.uid} role=${user.role} storeName=${user.storeName} storeId=${user.storeId}`);

    // ── Self-heal: resolve storeId for store owners who were created before
    //   the Store collection existed, or where the save was incomplete.
    if (!req.user.storeId && req.user.storeName) {
      const store = await Store.findOne({ slug: req.user.storeName });
      if (store) {
        req.user.storeId = store._id;
        // Persist so this lookup only happens once
        user.storeId = store._id;
        await user.save();
      }
    }

    next();
  } catch (err) {
    console.error('[attachUserRole]', err.message);
    return res.status(500).json({ message: 'Server error while loading user profile' });
  }
};
