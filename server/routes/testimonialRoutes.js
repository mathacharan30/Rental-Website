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

const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { allowRoles }      = require('../middlewares/roleMiddleware');

const storeGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['store_owner', 'super_admin'])];

router.post('/',                    createTestimonial);   // customers can post
router.get('/',                     getAllTestimonials);
router.get('/top/by-product',       getTopTestimonialsAcrossProducts);
router.get('/product/:productId',   getTestimonialsByProduct);
router.put('/:id',                  ...storeGuard, updateTestimonial);
router.delete('/:id',               ...storeGuard, deleteTestimonial);

module.exports = router;
