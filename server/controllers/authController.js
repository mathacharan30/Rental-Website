const firebaseAdmin = require('../config/firebase');
const User = require('../models/User');

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
// Creates Firebase user + MongoDB customer profile.
// Body: { name, email, password, phone?, address? }
exports.signup = async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  try {
    const firebaseUser = await firebaseAdmin.auth().createUser({
      email,
      password,
      displayName: name,
    });
    const user = await User.create({
      uid:     firebaseUser.uid,
      email,
      role:    'customer',
      name,
      phone:   phone   || null,
      address: address || null,
    });
    return res.status(201).json({
      message: 'Account created successfully',
      user: { uid: user.uid, email: user.email, role: user.role, name: user.name },
    });
  } catch (err) {
    console.error('[Auth] signup error:', err.message);
    if (err.code === 'auth/email-already-exists') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    return res.status(500).json({ message: 'Server error during signup' });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns the caller's MongoDB profile (role, storeName, etc.).
// Requires verifyFirebaseToken + attachUserRole middlewares.
exports.me = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('[Auth] me error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Alias kept for backwards-compat
exports.profile = exports.me;