const express = require('express');
const router = express.Router();
const { productUpload }    = require('../middlewares/upload');
const verifyFirebaseToken  = require('../middlewares/verifyFirebaseToken');
const attachUserRole       = require('../middlewares/attachUserRole');
const { allowRoles }       = require('../middlewares/roleMiddleware');
const mongoose = require('mongoose');

const storeGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['store_owner', 'super_admin'])];
const {
  getAllProducts,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProductsByCategory,
  getTopPicks,
} = require('../controllers/productController');

router.get('/',          getAllProducts);
router.get('/top-picks', getTopPicks);
router.get('/mine',      ...storeGuard, getMyProducts);  // store-scoped list
router.get('/:id',       getProductById);
// Wrap multer so file-size errors return a clean JSON 413 instead of crashing
const uploadImages = (req, res, next) => {
  productUpload.array('images', 4)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'Each image must be under 4 MB. Please compress and retry.' });
      }
      console.error('[Upload] Multer error:', err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.post('/createProduct', ...storeGuard, uploadImages, createProduct);
router.put('/:id',            ...storeGuard, uploadImages, updateProduct);
router.delete('/:id',         ...storeGuard, deleteProduct);

module.exports = router;