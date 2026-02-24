const express = require('express');
const router  = express.Router();

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

router.post('/',              ...customerGuard,   createOrder);
router.get('/mine',           ...customerGuard,   getMyOrders);
router.get('/store',          ...storeGuard,      getStoreOrders);
router.get('/all',            ...superAdminGuard, getAllOrders);
router.patch('/:id/status',   ...storeGuard,      updateOrderStatus);

module.exports = router;
