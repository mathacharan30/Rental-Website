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
  deleteProduct,
  getProductById,
  getProductsByCategory,
  getTopPicks,
} = require('../controllers/productController');

router.get('/',          getAllProducts);
router.get('/top-picks', getTopPicks);
router.get('/mine',      ...storeGuard, getMyProducts);  // store-scoped list
router.get('/:id',       getProductById);
router.post('/createProduct', ...storeGuard, productUpload.array('images', 4), createProduct);
router.delete('/:id',         ...storeGuard, deleteProduct);

module.exports = router;