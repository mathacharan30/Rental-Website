const express = require('express');
const router  = express.Router();

const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { allowRoles }      = require('../middlewares/roleMiddleware');

const {
  createPayment,
  webhook,
  getOrderStatus,
  createRefund,
  getRefundStatus,
} = require('../controllers/paymentController');

// ── Middleware to preserve the raw body for webhook signature validation ──────
const captureRawBody = express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString('utf-8');
  },
});

const customerGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['customer'])];

// ── Routes ───────────────────────────────────────────────────────────────────

// Initiate a payment (authenticated customer only)
router.post('/create', ...customerGuard, createPayment);

// PhonePe server-to-server callback (no auth — PhonePe calls this)
router.post('/webhook', captureRawBody, webhook);

// Check payment status by merchantOrderId (public — called right after redirect)
router.get('/status/:merchantOrderId', getOrderStatus);

// Initiate a refund
router.post('/refund', createRefund);

// Check refund status
router.get('/refund-status/:refundId', getRefundStatus);

module.exports = router;
