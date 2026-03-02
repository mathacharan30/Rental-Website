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

// ── Webhook Basic-Auth guard ─────────────────────────────────────────────────
// PhonePe sends the credentials you configure as  Authorization: Basic base64(user:pass)
const verifyWebhookBasicAuth = (req, res, next) => {
  const expectedUser = process.env.PHONEPE_WEBHOOK_USERNAME;
  const expectedPass = process.env.PHONEPE_WEBHOOK_PASSWORD;

  if (!expectedUser || !expectedPass) {
    console.error('[Webhook] PHONEPE_WEBHOOK_USERNAME / PHONEPE_WEBHOOK_PASSWORD not set');
    return res.status(500).json({ success: false, message: 'Webhook credentials not configured' });
  }

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Basic ')) {
    return res.status(401).json({ success: false, message: 'Missing Basic auth' });
  }

  const base64    = authHeader.slice(6); // strip "Basic "
  const decoded   = Buffer.from(base64, 'base64').toString('utf-8');
  const [user, ...rest] = decoded.split(':');
  const pass      = rest.join(':'); // password may contain colons

  if (user !== expectedUser || pass !== expectedPass) {
    console.warn('[Webhook] Invalid Basic-auth credentials');
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  next();
};

// ── Routes ───────────────────────────────────────────────────────────────────

// Initiate a payment (authenticated customer only)
router.post('/create', ...customerGuard, createPayment);

// PhonePe server-to-server callback (Basic-auth protected)
router.post('/webhook', captureRawBody, verifyWebhookBasicAuth, webhook);

// Check payment status by merchantOrderId (public — called right after redirect)
router.get('/status/:merchantOrderId', getOrderStatus);

// Initiate a refund
router.post('/refund', createRefund);

// Check refund status
router.get('/refund-status/:refundId', getRefundStatus);

module.exports = router;
