const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { allowRoles }      = require('../middlewares/roleMiddleware');

const storeGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['store_owner', 'super_admin'])];
const { getCategories, createCategory, updateCategory, deleteCategory, getProductsByCategory, signCategoryUpload } = require('../controllers/categoryController');

// sign-upload must come before /:id to avoid being consumed by the param route
router.get('/sign-upload', ...storeGuard, signCategoryUpload);
router.get('/', getCategories);
router.get('/:id/products', getProductsByCategory);
router.post('/', ...storeGuard, createCategory);
router.put('/:id', ...storeGuard, updateCategory);
router.delete('/:id', ...storeGuard, deleteCategory);

module.exports = router;