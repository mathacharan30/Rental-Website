const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  registerUser,
  registerAdmin,
  login,
  logout,
  refreshToken,
  profile,
} = require('../controllers/authController');

// Optional user registration (enable if desired)
router.post('/register', registerUser);
// Dedicated admin register
router.post('/admin/register', registerAdmin);

router.post('/login', login); // Unified login
router.post('/logout', logout);
router.post('/token', refreshToken);
router.get('/profile', verifyToken, profile);

module.exports = router;