/**
 * Payment Controller – PhonePe Standard Checkout
 *
 * Integrated flow:
 *   1. User clicks "Rent Now" → POST /api/payment/create
 *      - Creates Order (pending) + Payment (PENDING) in MongoDB
 *      - Initiates PhonePe pay request → returns checkoutUrl
 *   2. PhonePe redirects user → frontend /payment/status/:merchantOrderId
 *   3. POST /api/payment/webhook  ← PhonePe server callback
 *   4. GET  /api/payment/status/:merchantOrderId  ← frontend polls
 *   5. POST /api/payment/refund + GET refund-status
 */

const crypto            = require('crypto');
const { v4: uuidv4 }   = require('uuid');
const {
  StandardCheckoutPayRequest,
  RefundRequest,
} = require('pg-sdk-node');

const phonepeClient = require('../config/phonepeClient');
const Payment       = require('../models/Payment');
const Order         = require('../models/Order');
const Product       = require('../models/Product');
const { processOrderConfirmation, generateCreditNote } = require('../utils/invoiceService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handlePhonePeError(res, err, context) {
  const statusCode = err.httpStatusCode || 500;
  const payload = {
    message: err.message || `PhonePe error in ${context}`,
    errorCode: err.code || null,
    errorData: err.data || null,
  };
  console.error(`[Payment] ${context}:`, JSON.stringify(payload, null, 2));
  return res.status(statusCode).json(payload);
}

/**
 * Sync both Payment + linked Order when PhonePe confirms a state change.
 */
async function syncPaymentAndOrder(merchantOrderId, phonePeState, details) {
  const statusMap = { COMPLETED: 'SUCCESS', FAILED: 'FAILED' };
  const newPaymentStatus = statusMap[phonePeState] || 'PENDING';

  const payment = await Payment.findOneAndUpdate(
    { merchantOrderId },
    { status: newPaymentStatus, paymentDetails: details },
    { new: true },
  );

  if (payment?.orderId) {
    const orderUpdates = {};

    if (newPaymentStatus === 'SUCCESS') {
      orderUpdates.paymentStatus = 'paid';
      orderUpdates.status        = 'confirmed';
      orderUpdates.paymentMethod = 'phonepe';
      orderUpdates.paymentId     = merchantOrderId;
    } else if (newPaymentStatus === 'FAILED') {
      orderUpdates.paymentStatus = 'pending';
      orderUpdates.status        = 'cancelled';
    }

    if (Object.keys(orderUpdates).length) {
      await Order.findByIdAndUpdate(payment.orderId, orderUpdates);
      
      if (orderUpdates.status === 'confirmed') {
        await processOrderConfirmation(payment.orderId);
      } else if (orderUpdates.status === 'cancelled') {
        await generateCreditNote(payment.orderId);
      }
    }
  }

  return { payment, newPaymentStatus };
}

// ─── 1. Create Payment (integrated with Order) ──────────────────────────────

exports.createPayment = async (req, res) => {
  try {
    const { productId, size, startDate, endDate, notes } = req.body;

    // req.user is set by verifyFirebaseToken + attachUserRole
    const userId   = req.user.dbId;    // MongoDB _id of the user
    const userUid  = req.user.uid;     // Firebase UID

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    // ── Fetch product for pricing ─────────────────────────────────────────
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!product.store) return res.status(400).json({ message: 'Product has no associated store' });

    const isSale          = product.listingType === 'sale';
    const rentPrice       = product.rentPrice       || 0;
    const commissionPrice = product.commissionPrice || 0;
    const salePrice       = product.salePrice       || 0;
    const advanceAmount   = isSale ? 0 : (product.advanceAmount || 0);
    const totalPrice      = isSale
      ? salePrice + commissionPrice
      : rentPrice + commissionPrice;
    const payableAmount   = isSale
      ? salePrice + commissionPrice               // sale: customer pays full sale + commission
      : advanceAmount + commissionPrice;           // rent: customer pays only advance + commission

    // ── Create Order (pending) ────────────────────────────────────────────
    const order = await Order.create({
      customer:        userId,
      product:         product._id,
      store:           product.store,
      size:            size || '',
      startDate:       startDate || null,
      endDate:         endDate   || null,
      notes:           notes     || '',
      listingType:     product.listingType || 'rent',
      rentPrice,
      commissionPrice,
      salePrice,
      advanceAmount,
      totalPrice,
      status:          'pending',
      paymentStatus:   'pending',
      paymentMethod:   'phonepe',
    });

    // ── PhonePe payment ───────────────────────────────────────────────────
    const merchantOrderId = uuidv4();
    const amountInPaise   = Math.round(payableAmount * 100);
    const redirectUrl     = `${process.env.CLIENT_ORIGIN}/payment/status/${merchantOrderId}`;

    const payRequest = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amountInPaise)
      .redirectUrl(redirectUrl)
      .build();

    const payResponse = await phonepeClient.pay(payRequest);

    // ── Save Payment record (linked to the order) ─────────────────────────
    await Payment.create({
      userId:  userUid,
      merchantOrderId,
      orderId: order._id,
      amount:  amountInPaise,
      status:  'PENDING',
    });

    // Also save the merchantOrderId on the Order so we can look it up later
    order.paymentId = merchantOrderId;
    await order.save();

    return res.status(201).json({
      success: true,
      checkoutUrl: payResponse.redirectUrl,
      merchantOrderId,
      orderId: order._id,
    });
  } catch (err) {
    return handlePhonePeError(res, err, 'createPayment');
  }
};

// ─── 2. Webhook Handler ──────────────────────────────────────────────────────

exports.webhook = async (req, res) => {
  // ── Log everything so Vercel logs show whether PhonePe is calling us ────────
  console.log('[Webhook] ===== INCOMING REQUEST =====');
  console.log('[Webhook] Time         :', new Date().toISOString());
  console.log('[Webhook] Method       :', req.method);
  console.log('[Webhook] Headers      :', JSON.stringify(req.headers, null, 2));
  console.log('[Webhook] Body         :', JSON.stringify(req.body));

  try {
    const authorization = (req.headers.authorization || '').trim();
    const webhookUser   = process.env.PHONEPE_WEBHOOK_USERNAME || '';
    const webhookPass   = process.env.PHONEPE_WEBHOOK_PASSWORD || '';

    console.log('[Webhook] Authorization header :', authorization || '(missing)');
    console.log('[Webhook] WEBHOOK_USER env      :', webhookUser || '(not set)');
    console.log('[Webhook] WEBHOOK_PASS env      :', webhookPass ? '(set)' : '(not set)');

    // ── Manual SHA-256 verification (replaces SDK validateCallback) ──────
    // PhonePe sends:  Authorization: SHA256(webhookUsername + ":" + webhookPassword)
    const expectedHash = crypto
      .createHash('sha256')
      .update(webhookUser + ':' + webhookPass)
      .digest('hex');

    console.log('[Webhook] Expected hash         :', expectedHash);
    console.log('[Webhook] Received hash         :', authorization);
    console.log('[Webhook] Hash match?           :', authorization === expectedHash);

    if (authorization !== expectedHash) {
      console.error('[Webhook] ❌ Authorization hash mismatch — rejecting');
      return res.status(200).json({ success: false, message: 'Authorization mismatch' });
    }

    console.log('[Webhook] ✅ Authorization verified');

    // ── Parse the payload ────────────────────────────────────────────────
    const body = req.body || {};
    // PhonePe sends: { type: "PG_ORDER_COMPLETED", payload: { merchantOrderId, state, ... } }
    const eventType = body.type || 'UNKNOWN';
    const payload   = body.payload || body;

    console.log('[Webhook] Event type :', eventType);
    console.log('[Webhook] Payload    :', JSON.stringify(payload));

    const merchantOrderId = payload.merchantOrderId;
    const state           = payload.state;

    if (merchantOrderId && state) {
      console.log('[Webhook] Syncing order:', merchantOrderId, '| state:', state);
      await syncPaymentAndOrder(merchantOrderId, state, payload);
      console.log('[Webhook] DB sync complete ✅');
    } else {
      console.warn('[Webhook] No merchantOrderId/state in payload — skipping DB sync');
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Webhook] ❌ Error:', err.message, err.stack);
    return res.status(200).json({ success: false, message: err.message });
  }
};

// ─── 3. Order Status ─────────────────────────────────────────────────────────

exports.getOrderStatus = async (req, res) => {
  try {
    const { merchantOrderId } = req.params;

    const statusResponse = await phonepeClient.getOrderStatus(merchantOrderId, true);

    // Sync both Payment and Order
    await syncPaymentAndOrder(merchantOrderId, statusResponse.state, statusResponse);

    // Fire-and-forget: also sync any other stale pending payments in the background
    syncAllPendingPayments().catch((e) =>
      console.error('[SyncPending] background error:', e.message)
    );

    return res.json({
      success: true,
      orderState: statusResponse.state,
      amount: statusResponse.amount,
      paymentDetails: statusResponse.paymentDetails,
    });
  } catch (err) {
    return handlePhonePeError(res, err, 'getOrderStatus');
  }
};

// ─── 3b. Sync All Pending Payments (webhook fallback) ───────────────────────

/**
 * Finds all PENDING payments older than 2 minutes, checks their status with
 * PhonePe, and updates the DB.  Acts as a safety net when webhooks don't fire.
 */
async function syncAllPendingPayments() {
  const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);

  const stalePayments = await Payment.find({
    status: 'PENDING',
    createdAt: { $lt: twoMinAgo },
  }).limit(20);

  if (!stalePayments.length) return { synced: 0 };

  console.log(`[SyncPending] Found ${stalePayments.length} stale PENDING payment(s)`);

  let synced = 0;
  for (const pmt of stalePayments) {
    try {
      const statusResponse = await phonepeClient.getOrderStatus(
        pmt.merchantOrderId,
        true,
      );
      await syncPaymentAndOrder(pmt.merchantOrderId, statusResponse.state, statusResponse);
      synced++;
      console.log(`[SyncPending] ✅ ${pmt.merchantOrderId} → ${statusResponse.state}`);
    } catch (err) {
      // If PhonePe has no record of this order, mark it FAILED so it is never retried
      if (err.message && err.message.includes('No entry found')) {
        await Payment.findOneAndUpdate(
          { merchantOrderId: pmt.merchantOrderId },
          { status: 'FAILED' },
        );
        await Order.findByIdAndUpdate(pmt.orderId, {
          paymentStatus: 'pending',
          status: 'cancelled',
        });
        console.log(`[SyncPending] 🗑️  ${pmt.merchantOrderId} → not found on PhonePe, marked FAILED`);
      } else {
        console.error(`[SyncPending] ❌ ${pmt.merchantOrderId}:`, err.message);
      }
    }
  }

  return { synced, total: stalePayments.length };
}

/**
 * Public endpoint: GET /api/payment/sync-pending
 * Can be called by a cron service (e.g. cron-job.org) every 2–5 minutes.
 */
exports.syncPending = async (req, res) => {
  try {
    const result = await syncAllPendingPayments();
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[SyncPending] ❌', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 4. Refund ───────────────────────────────────────────────────────────────

exports.createRefund = async (req, res) => {
  try {
    const { merchantOrderId, refundId, amount } = req.body;

    if (!merchantOrderId || !refundId || !amount) {
      return res
        .status(400)
        .json({ message: 'merchantOrderId, refundId, and amount are required' });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    const refundRequest = RefundRequest.builder()
      .merchantRefundId(refundId)
      .originalMerchantOrderId(merchantOrderId)
      .amount(amountInPaise)
      .build();

    const refundResponse = await phonepeClient.refund(refundRequest);

    await Payment.findOneAndUpdate(
      { merchantOrderId },
      { refundDetails: refundResponse },
    );

    return res.json({
      success: true,
      refundId: refundResponse.refundId,
      amount: refundResponse.amount,
      state: refundResponse.state,
    });
  } catch (err) {
    return handlePhonePeError(res, err, 'createRefund');
  }
};

// ─── 5. Refund Status ────────────────────────────────────────────────────────

exports.getRefundStatus = async (req, res) => {
  try {
    const { refundId } = req.params;

    const refundStatus = await phonepeClient.getRefundStatus(refundId);

    return res.json({
      success: true,
      merchantRefundId: refundStatus.merchantRefundId,
      originalMerchantOrderId: refundStatus.originalMerchantOrderId,
      amount: refundStatus.amount,
      state: refundStatus.state,
      paymentDetails: refundStatus.paymentDetails,
    });
  } catch (err) {
    return handlePhonePeError(res, err, 'getRefundStatus');
  }
};
