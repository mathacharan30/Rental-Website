const express = require('express');
const router = express.Router();
const {
  createTestimonial,
  getAllTestimonials,
  getTopTestimonialsAcrossProducts,
  getTestimonialsByProduct,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');

router.post('/', createTestimonial);
router.get('/', getAllTestimonials);
router.get('/top/by-product', getTopTestimonialsAcrossProducts);
router.get('/product/:productId', getTestimonialsByProduct);
router.put('/:id', updateTestimonial);
router.delete('/:id', deleteTestimonial);

module.exports = router;
