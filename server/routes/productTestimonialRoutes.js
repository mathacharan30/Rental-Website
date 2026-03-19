const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole = require('../middlewares/attachUserRole');
const { productTestimonialUpload } = require('../middlewares/upload');

const {
  addTestimonial,
  getTestimonialsByProduct
} = require('../controllers/productTestimonialController');

// Wrapper to handle multer errors gracefully
const uploadImage = (req, res, next) => {
  productTestimonialUpload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'Image must be under 10 MB.' });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// @route   GET /api/product-testimonials/product/:productId
router.get('/product/:productId', getTestimonialsByProduct);

// @route   POST /api/product-testimonials
// Protected route: user must be authenticated
router.post(
  '/',
  verifyFirebaseToken,
  attachUserRole,
  uploadImage,
  addTestimonial
);

module.exports = router;
