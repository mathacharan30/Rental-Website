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

const { v4: uuidv4 } = require('uuid');
const {
  StandardCheckoutPayRequest,
  RefundRequest,
} = require('pg-sdk-node');

const phonepeClient = require('../config/phonepeClient');
const Payment       = require('../models/Payment');
const Order         = require('../models/Order');
const Product       = require('../models/Product');

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

    const rentPrice       = product.rentPrice;
    const commissionPrice = product.commissionPrice;
    const advanceAmount   = product.advanceAmount || 0;
    const totalPrice      = rentPrice + commissionPrice;
    const payableAmount   = rentPrice + advanceAmount + commissionPrice; // amount user actually pays

    // ── Create Order (pending) ────────────────────────────────────────────
    const order = await Order.create({
      customer:        userId,
      product:         product._id,
      store:           product.store,
      size:            size || '',
      startDate:       startDate || null,
      endDate:         endDate   || null,
      notes:           notes     || '',
      rentPrice,
      commissionPrice,
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
  try {
    const rawBody       = req.rawBody || JSON.stringify(req.body);
    const authorization = req.headers.authorization || '';

    const callbackResponse = phonepeClient.validateCallback(
      process.env.PHONEPE_CLIENT_ID,
      process.env.PHONEPE_CLIENT_SECRET,
      authorization,
      rawBody,
    );

    const { payload } = callbackResponse;

    if (payload.merchantOrderId) {
      await syncPaymentAndOrder(
        payload.merchantOrderId,
        payload.state,
        payload,
      );
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Payment] webhook validation error:', err.message);
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
