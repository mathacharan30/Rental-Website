const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole = require('../middlewares/attachUserRole');
const { allowRoles } = require('../middlewares/roleMiddleware');

const {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} = require('../controllers/favoriteController');

// All favorites routes require customer role
const customerGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['customer'])];

router.get('/', ...customerGuard, getFavorites);
router.post('/', ...customerGuard, addFavorite);
router.delete('/:productId', ...customerGuard, removeFavorite);
router.get('/check/:productId', ...customerGuard, checkFavorite);

module.exports = router;

