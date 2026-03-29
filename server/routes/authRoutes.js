const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');

const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { signup, me, sendPasswordReset } = require('../controllers/authController');

// ── Validation middleware helper ───────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// POST /api/auth/signup  – customer self-registration
router.post(
  '/signup',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 20 }).withMessage('Phone number too long'),
    body('address')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 500 }).withMessage('Address too long'),
  ],
  validate,
  signup,
);

// POST /api/auth/forgot-password – send password-reset email via backend
router.post(
  '/forgot-password',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
  ],
  validate,
  sendPasswordReset,
);

// GET  /api/auth/me      – return logged-in user's role + profile
router.get('/me', verifyFirebaseToken, attachUserRole, me);

// Alias kept for backwards-compat
router.get('/profile', verifyFirebaseToken, attachUserRole, me);

module.exports = router;
