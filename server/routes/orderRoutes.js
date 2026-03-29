const express = require('express');
const router  = express.Router();
const { body, param, validationResult } = require('express-validator');

const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { allowRoles }      = require('../middlewares/roleMiddleware');

const {
  createOrder,
  getMyOrders,
  getStoreOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const customerGuard   = [verifyFirebaseToken, attachUserRole, allowRoles(['customer'])];
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
  ...customerGuard,
  [
    body('productId').trim().notEmpty().withMessage('productId is required').isMongoId().withMessage('Invalid productId'),
    body('size').optional().trim().isLength({ max: 50 }).withMessage('Size too long'),
    body('startDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid startDate'),
    body('endDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid endDate'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes too long'),
  ],
  validate,
  createOrder,
);

router.get('/mine',         ...customerGuard,   getMyOrders);
router.get('/store',        ...storeGuard,      getStoreOrders);
router.get('/all',          ...superAdminGuard, getAllOrders);
router.patch(
  '/:id/status',
  ...storeGuard,
  [
    param('id').isMongoId().withMessage('Invalid order id'),
    body('status').trim().notEmpty().withMessage('status is required'),
  ],
  validate,
  updateOrderStatus,
);

module.exports = router;
