const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
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

const storeGuard      = [verifyFirebaseToken, attachUserRole, allowRoles(['store_owner', 'super_admin'])];
const superAdminGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['super_admin'])];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

router.post(
  '/',
  ...superAdminGuard,
  [
    body('userName').trim().notEmpty().withMessage('userName is required').isLength({ max: 100 }),
    body('handle').optional().trim().isLength({ max: 50 }),
    body('comment').trim().notEmpty().withMessage('comment is required').isLength({ max: 1000 }),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5'),
    body('product').isMongoId().withMessage('Invalid product id'),
    body('isTop').optional().isBoolean(),
  ],
  validate,
  createTestimonial,
);

router.get('/',                     getAllTestimonials);
router.get('/top/by-product',       getTopTestimonialsAcrossProducts);
router.get('/product/:productId',   getTestimonialsByProduct);
router.put('/:id',                  ...storeGuard, updateTestimonial);
router.delete(
  '/:id',
  ...storeGuard,
  [param('id').isMongoId().withMessage('Invalid testimonial id')],
  validate,
  deleteTestimonial,
);

module.exports = router;
