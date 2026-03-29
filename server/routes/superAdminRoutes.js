const express = require('express');
const router  = express.Router();
const { body, param, validationResult } = require('express-validator');

const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { allowRoles }      = require('../middlewares/roleMiddleware');
const {
  getStores,
  createStore,
  deleteStore,
  getAllUsers,
  getAllCities,
  createCity,
  updateCity,
  deleteCity,
} = require('../controllers/superAdminController');

// All superadmin routes require: valid Firebase token + super_admin role
const guard = [verifyFirebaseToken, attachUserRole, allowRoles(['super_admin'])];

// ── Validation helper ─────────────────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

router.get('/stores',          ...guard, getStores);
router.post(
  '/stores',
  ...guard,
  [
    body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 100 }),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('storeName').trim().notEmpty().withMessage('storeName is required').isLength({ max: 100 }),
  ],
  validate,
  createStore,
);
router.delete(
  '/stores/:uid',
  ...guard,
  [param('uid').trim().notEmpty().withMessage('uid is required')],
  validate,
  deleteStore,
);
router.get('/users',           ...guard, getAllUsers);

// Delivery city management (super admin only)
router.get('/cities',          ...guard, getAllCities);
router.post(
  '/cities',
  ...guard,
  [
    body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 100 }),
    body('deliveryCharge').isNumeric().withMessage('deliveryCharge must be a number'),
  ],
  validate,
  createCity,
);
router.put(
  '/cities/:id',
  ...guard,
  [
    param('id').isMongoId().withMessage('Invalid city id'),
    body('name').optional().trim().isLength({ max: 100 }),
    body('deliveryCharge').optional().isNumeric().withMessage('deliveryCharge must be a number'),
    body('active').optional().isBoolean().withMessage('active must be boolean'),
  ],
  validate,
  updateCity,
);
router.delete(
  '/cities/:id',
  ...guard,
  [param('id').isMongoId().withMessage('Invalid city id')],
  validate,
  deleteCity,
);

module.exports = router;
