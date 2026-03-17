/**
 * One-time script to fix all stuck PENDING payments.
 * Connects to production DB, checks each PENDING payment with PhonePe,
 * and updates both Payment + Order records.
 *
 * Run from the server/ directory:
 *   node scripts/fixPendingOrders.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const phonepeClient = require('../config/phonepeClient');
const Payment       = require('../models/Payment');
const Order         = require('../models/Order');

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

  return newPaymentStatus;
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.\n');

  const pendingPayments = await Payment.find({ status: 'PENDING' });
  console.log(`Found ${pendingPayments.length} PENDING payment(s)\n`);

  if (!pendingPayments.length) {
    console.log('Nothing to fix. Exiting.');
    process.exit(0);
  }

  let fixed = 0, failed = 0, stillPending = 0;

  for (const pmt of pendingPayments) {
    process.stdout.write(`Checking ${pmt.merchantOrderId} ... `);
    try {
      const statusResponse = await phonepeClient.getOrderStatus(pmt.merchantOrderId, true);
      const newStatus = await syncPaymentAndOrder(
        pmt.merchantOrderId,
        statusResponse.state,
        statusResponse,
      );

      if (newStatus === 'SUCCESS') {
        console.log(`✅ COMPLETED → confirmed`);
        fixed++;
      } else if (newStatus === 'FAILED') {
        console.log(`❌ FAILED → cancelled`);
        failed++;
      } else {
        console.log(`⏳ still PENDING (payment not completed on PhonePe)`);
        stillPending++;
      }
    } catch (err) {
      console.log(`⚠️  Error: ${err.message}`);
    }
  }

  console.log('\n════════════════════════════════');
  console.log(`✅ Confirmed  : ${fixed}`);
  console.log(`❌ Cancelled  : ${failed}`);
  console.log(`⏳ Still pending: ${stillPending}`);
  console.log('════════════════════════════════');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});

