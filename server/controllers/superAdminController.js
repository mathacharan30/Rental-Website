const firebaseAdmin = require('../config/firebase');
const User = require('../models/User');

// ─── GET /api/superadmin/stores ───────────────────────────────────────────────
// Returns all store_owner documents.
exports.getStores = async (req, res) => {
  try {
    const stores = await User.find({ role: 'store_owner' }).lean();
    return res.json({ stores });
  } catch (err) {
    console.error('[SuperAdmin] getStores:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── POST /api/superadmin/stores ──────────────────────────────────────────────
// Creates a Firebase user + MongoDB store_owner profile.
// Body: { name, email, password, storeName }
exports.createStore = async (req, res) => {
  const { name, email, password, storeName } = req.body;
  if (!name || !email || !password || !storeName) {
    return res.status(400).json({ message: 'name, email, password and storeName are required' });
  }
  try {
    // 1. Create Firebase account (emailVerified = true — admin-created accounts skip verification)
    const firebaseUser = await firebaseAdmin.auth().createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
    });

    // 2. Persist in MongoDB
    const user = await User.create({
      uid:       firebaseUser.uid,
      email,
      role:      'store_owner',
      storeName: storeName.trim().toLowerCase().replace(/\s+/g, '-'),
      name,
    });

    return res.status(201).json({
      message: 'Store owner created',
      user: { uid: user.uid, email: user.email, role: user.role, storeName: user.storeName },
    });
  } catch (err) {
    console.error('[SuperAdmin] createStore:', err.message);
    if (err.code === 'auth/email-already-exists') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    return res.status(500).json({ message: 'Server error creating store owner' });
  }
};

// ─── DELETE /api/superadmin/stores/:uid ──────────────────────────────────────
// Deletes Firebase account + MongoDB record for a store_owner.
exports.deleteStore = async (req, res) => {
  const { uid } = req.params;
  try {
    await firebaseAdmin.auth().deleteUser(uid);
    await User.findOneAndDelete({ uid });
    return res.json({ message: 'Store owner deleted' });
  } catch (err) {
    console.error('[SuperAdmin] deleteStore:', err.message);
    return res.status(500).json({ message: 'Server error deleting store owner' });
  }
};

// ─── GET /api/superadmin/users ────────────────────────────────────────────────
// Returns all users (all roles).
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    return res.json({ users });
  } catch (err) {
    console.error('[SuperAdmin] getAllUsers:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};
