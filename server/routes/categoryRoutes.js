const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { allowRoles }      = require('../middlewares/roleMiddleware');
const { categoryUpload }  = require('../middlewares/upload');

const storeGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['store_owner', 'super_admin'])];
const { getCategories, createCategory, deleteCategory, getProductsByCategory } = require('../controllers/categoryController');

router.get('/', getCategories);
router.get('/:id/products', getProductsByCategory);
// Create category with single image upload (field name: 'image')
router.post('/', ...storeGuard, categoryUpload.single('image'), createCategory);

// Delete category and cascade delete products
router.delete('/:id', ...storeGuard, deleteCategory);

module.exports = router;