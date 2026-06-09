const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { allowRoles }      = require('../middlewares/roleMiddleware');

const storeGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['store_owner', 'super_admin'])];
const {
  signMakeupCategoryUpload,
  getMakeupCategories,
  createMakeupCategory,
  updateMakeupCategory,
  deleteMakeupCategory,
} = require('../controllers/makeupCategoryController');

// sign-upload must come before /:id to avoid being consumed by the param route
router.get('/sign-upload', ...storeGuard, signMakeupCategoryUpload);
router.get('/', getMakeupCategories);
router.post('/', ...storeGuard, createMakeupCategory);
router.put('/:id', ...storeGuard, updateMakeupCategory);
router.delete('/:id', ...storeGuard, deleteMakeupCategory);

module.exports = router;
