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

const captureRawBody = express.json({
  verify: (req, res, buf) => {
    const raw = buf.toString('utf-8');
    req.rawBody = raw;

    // 🔍 Debug logs
    console.log("📦 Raw body middleware triggered");
    console.log("➡️ Method:", req.method);
    console.log("➡️ URL:", req.originalUrl);

    if (raw) {
      console.log("➡️ Raw body length:", raw.length);
      console.log("➡️ Raw body preview:", raw.substring(0, 200)); // first 200 chars only
    } else {
      console.log("⚠️ Empty raw body");
    }
  },
});

const customerGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['customer'])];

// ── Webhook SHA-256 guard ─────────────────────────────────────────────────────
// PhonePe sends:  Authorization: SHA256(webhookUsername + ":" + webhookPassword)
// The pg-sdk-node validateCallback uses the same hash, so we let the SDK handle
// the real signature check.  We just ensure the header is present here.
const verifyWebhookAuth = (req, res, next) => {
  console.log("next middleware hit");
  const authHeader = req.headers.authorization || '';
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Missing Authorization header' });
  }
  next();
};

// ── Routes ───────────────────────────────────────────────────────────────────

// Initiate a payment (authenticated customer only)
router.post('/create', ...customerGuard, createPayment);

// PhonePe server-to-server callback (SHA-256 signature validated inside webhook handler)
// router.post('/webhook', captureRawBody, verifyWebhookAuth, webhook);
router.post('/webhook', webhook);


// Check payment status by merchantOrderId (public — called right after redirect)
router.get('/status/:merchantOrderId', getOrderStatus);

// Initiate a refund
router.post('/refund', createRefund);

// Check refund status
router.get('/refund-status/:refundId', getRefundStatus);

module.exports = router;
