const express = require('express');
const router  = express.Router();

const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { signup, me }      = require('../controllers/authController');

// POST /api/auth/signup  – customer self-registration
router.post('/signup', signup);

// GET  /api/auth/me      – return logged-in user's role + profile
router.get('/me', verifyFirebaseToken, attachUserRole, me);

// Alias kept for backwards-compat
router.get('/profile', verifyFirebaseToken, attachUserRole, me);

module.exports = router;