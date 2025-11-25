const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { categoryUpload } = require('../middlewares/upload');
const { getCategories, createCategory, deleteCategory, getProductsByCategory } = require('../controllers/categoryController');

router.get('/', getCategories);
router.get('/:id/products', getProductsByCategory);
// Create category with single image upload (field name: 'image')
router.post('/', verifyToken, categoryUpload.single('image'), createCategory);

// Delete category and cascade delete products
router.delete('/:id', verifyToken, deleteCategory);

module.exports = router;