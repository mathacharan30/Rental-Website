const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole = require('../middlewares/attachUserRole');
const { allowRoles } = require('../middlewares/roleMiddleware');

const {
  getFavorites,
  getFavoriteIds,
  addFavorite,
  removeFavorite,
  checkFavorite,
} = require('../controllers/favoriteController');

// All favorites routes require customer role
const customerGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['customer'])];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

router.get('/', ...customerGuard, getFavorites);
router.get('/ids', ...customerGuard, getFavoriteIds);

router.post(
  '/',
  ...customerGuard,
  [body('productId').isMongoId().withMessage('Invalid productId')],
  validate,
  addFavorite,
);

router.delete(
  '/:productId',
  ...customerGuard,
  [param('productId').isMongoId().withMessage('Invalid productId')],
  validate,
  removeFavorite,
);

router.get(
  '/check/:productId',
  ...customerGuard,
  [param('productId').isMongoId().withMessage('Invalid productId')],
  validate,
  checkFavorite,
);

module.exports = router;
