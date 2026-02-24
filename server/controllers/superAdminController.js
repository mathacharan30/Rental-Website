const firebaseAdmin = require('../config/firebase');
const User  = require('../models/User');
const Store = require('../models/Store');

// ─── GET /api/superadmin/stores ───────────────────────────────────────────────
// Returns all Store documents with owner info populated.
exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find()
      .populate('owner', 'name email uid')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ stores });
  } catch (err) {
    console.error('[SuperAdmin] getStores:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── POST /api/superadmin/stores ──────────────────────────────────────────────
// Creates a Firebase user + MongoDB User doc + MongoDB Store doc.
// Body: { name, email, password, storeName }
exports.createStore = async (req, res) => {
  const { name, email, password, storeName } = req.body;
  if (!name || !email || !password || !storeName) {
    return res.status(400).json({ message: 'name, email, password and storeName are required' });
  }
  try {
    const slug = storeName.trim().toLowerCase().replace(/\s+/g, '-');

    // 1. Create Firebase account (emailVerified = true — admin-created accounts skip verification)
    const firebaseUser = await firebaseAdmin.auth().createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
    });

    // 2. Persist User in MongoDB (no storeId yet)
    const user = await User.create({
      uid:       firebaseUser.uid,
      email,
      role:      'store_owner',
      storeName: slug,
      name,
    });

    // 3. Create Store document
    const store = await Store.create({ name, slug, owner: user._id });

    // 4. Link storeId back onto the User
    user.storeId = store._id;
    await user.save();

    return res.status(201).json({
      message: 'Store created',
      store: { _id: store._id, name: store.name, slug: store.slug, owner: { uid: user.uid, email: user.email, name: user.name } },
    });
  } catch (err) {
    console.error('[SuperAdmin] createStore:', err.message);
    if (err.code === 'auth/email-already-exists') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    return res.status(500).json({ message: 'Server error creating store' });
  }
};

// ─── DELETE /api/superadmin/stores/:uid ──────────────────────────────────────
// Deletes Firebase account + MongoDB User + MongoDB Store for a store_owner.
exports.deleteStore = async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await User.findOne({ uid });
    if (user?.storeId) {
      await Store.findByIdAndDelete(user.storeId);
    }
    await firebaseAdmin.auth().deleteUser(uid);
    await User.findOneAndDelete({ uid });
    return res.json({ message: 'Store deleted' });
  } catch (err) {
    console.error('[SuperAdmin] deleteStore:', err.message);
    return res.status(500).json({ message: 'Server error deleting store' });
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
