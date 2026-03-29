const express = require('express');
const router  = express.Router();

const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { allowRoles }      = require('../middlewares/roleMiddleware');

const {
  createPayment,
  webhook,
  getOrderStatus,
  syncPending,
  createRefund,
  getRefundStatus,
} = require('../controllers/paymentController');

const customerGuard   = [verifyFirebaseToken, attachUserRole, allowRoles(['customer'])];
const superAdminGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['super_admin'])];

// Secret-token guard for cron-triggered endpoints (not user-facing)
const syncSecretGuard = (req, res, next) => {
  const secret = req.headers['x-sync-secret'] || req.query.secret;
  if (!process.env.SYNC_SECRET || secret !== process.env.SYNC_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// ── Routes ───────────────────────────────────────────────────────────────────

// Initiate a payment (authenticated customer only)
router.post('/create', ...customerGuard, createPayment);

// PhonePe server-to-server callback — manual SHA256 validation inside the handler
router.post('/webhook', webhook);

// Health check — visit in browser to verify the webhook URL is correct
router.get('/webhook', (req, res) => {
  res.json({ status: 'ok', message: 'Webhook endpoint is alive', time: new Date().toISOString() });
});

// Check payment status by merchantOrderId (public — called right after redirect)
router.get('/status/:merchantOrderId', getOrderStatus);

// Webhook fallback — sync all stale PENDING payments by calling PhonePe API
// Call via cron (e.g. cron-job.org) every 2–5 min. Requires X-Sync-Secret header.
router.get('/sync-pending', syncSecretGuard, syncPending);

// Initiate a refund (super_admin only)
router.post('/refund', ...superAdminGuard, createRefund);

// Check refund status (super_admin only)
router.get('/refund-status/:refundId', ...superAdminGuard, getRefundStatus);

module.exports = router;
