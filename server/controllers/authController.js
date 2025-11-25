const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

// Consistent expiry values (reuse those from admin controller for coherence)
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

// === TOKEN HELPERS ===
const signAccessToken = (doc) => {
  return jwt.sign(
    { id: doc._id, role: doc.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
};

const signRefreshToken = (doc) => {
  return jwt.sign(
    { id: doc._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );
};

// === REGISTER USER (optional helper) ===
// If you need a user registration, enable this route in routes. For now kept minimal.
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('[Auth] User Register Error:', error.message);
    return res.status(500).json({ message: 'Server error during user registration' });
  }
};

// === ADMIN REGISTER ===
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hash });

    return res.status(201).json({
      message: 'Admin registered successfully',
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.error('[Auth] Admin Register Error:', error.message);
    return res.status(500).json({ message: 'Server error during admin registration' });
  }
};


// === UNIFIED LOGIN ===
// Accepts: email, password and optional role hint ("admin" or "user").
// If role is provided we constrain lookup; else we attempt admin then user.
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let account = null;
    if (role === 'admin') {
      account = await Admin.findOne({ email });
    } else if (role === 'user') {
      account = await User.findOne({ email });
    } else {
      // Try admin first then user (common pattern if there's only one admin)
      account = await Admin.findOne({ email });
      if (!account) account = await User.findOne({ email });
    }

    if (!account) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, account.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = signAccessToken(account);
    const refreshToken = signRefreshToken(account);

    account.refreshTokens.push(refreshToken);
    await account.save();

    return res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { id: account._id, name: account.name, email: account.email, role: account.role }
    });
  } catch (error) {
    console.error('[Auth] Unified Login Error:', error.message);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// === ADMIN LOGIN (dedicated) ===
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = signAccessToken(admin);
    const refreshToken = signRefreshToken(admin);

    admin.refreshTokens.push(refreshToken);
    await admin.save();

    return res.json({
      message: 'Admin login successful',
      accessToken,
      refreshToken,
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.error('[Auth] Admin Login Error:', error.message);
    return res.status(500).json({ message: 'Server error during admin login' });
  }
};


// === LOGOUT (works for either model) ===
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'refreshToken is required' });
    }

    // Search in both collections
    let account = await Admin.findOne({ refreshTokens: refreshToken });
    if (!account) account = await User.findOne({ refreshTokens: refreshToken });
    if (!account) {
      return res.status(400).json({ message: 'Invalid refresh token' });
    }

    account.refreshTokens = account.refreshTokens.filter(t => t !== refreshToken);
    await account.save();
    return res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('[Auth] Unified Logout Error:', error.message);
    return res.status(500).json({ message: 'Server error during logout' });
  }
};

// === REFRESH TOKEN (unified) ===
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'refreshToken is required' });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Try both collections
    let account = await Admin.findOne({ _id: payload.id, refreshTokens: refreshToken });
    if (!account) account = await User.findOne({ _id: payload.id, refreshTokens: refreshToken });
    if (!account) {
      return res.status(401).json({ message: 'Refresh token not recognized' });
    }

    const newAccessToken = signAccessToken(account);
    const newRefreshToken = signRefreshToken(account);

    account.refreshTokens = account.refreshTokens.filter(t => t !== refreshToken);
    account.refreshTokens.push(newRefreshToken);
    await account.save();

    return res.json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('[Auth] Unified Refresh Error:', error.message);
    return res.status(500).json({ message: 'Server error refreshing token' });
  }
};

// === PROFILE (works for either account type) ===
exports.profile = async (req, res) => {
  try {
    const id = req.userId || req.adminId; // compatibility with existing middleware
    if (!id) return res.status(401).json({ message: 'Unauthorized' });

    let account = await Admin.findById(id).select('-password -refreshTokens');
    if (!account) account = await User.findById(id).select('-password -refreshTokens');
    if (!account) return res.status(404).json({ message: 'Account not found' });

    return res.json({ user: account });
  } catch (error) {
    console.error('[Auth] Unified Profile Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching profile' });
  }
};