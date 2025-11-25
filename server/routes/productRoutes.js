const express = require('express');
const router = express.Router();
const { productUpload } = require('../middlewares/upload');
const { verifyToken } = require('../middlewares/authMiddleware');
const mongoose = require('mongoose');
const {
  getAllProducts,
  createProduct,
  deleteProduct,
  getProductById,
  getProductsByCategory,
  getTopPicks,
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/top-picks', getTopPicks);
router.get('/:id', getProductById);
router.post('/createProduct',verifyToken, productUpload.array('images', 4), createProduct);
router.delete('/:id', verifyToken, deleteProduct);

module.exports = router;