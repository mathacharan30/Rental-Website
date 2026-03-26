/**
 * testInvoice.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Creates a synthetic test order (using the first available User, Product,
 * and Store in the DB) and runs the full invoice pipeline:
 *   ✓ Order created with all new fields (deliveryCharge, deliveryCity, etc.)
 *   ✓ Invoice generated and saved
 *   ✓ PDF uploaded to S3
 *   ✓ Email sent to the customer
 *
 * Usage (from the server/ directory):
 *   node scripts/testInvoice.js
 *
 * Optional: pass an existing Order ID as the first argument to RE-RUN
 * invoice generation for that specific order instead of creating a new one:
 *   node scripts/testInvoice.js 683abc1234567890abcdef01
 * ──────────────────────────────────────────────────────────────────────────────
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { processOrderConfirmation } = require('../utils/invoiceService');
const Order   = require('../models/Order');
const User    = require('../models/User');
const Product = require('../models/Product');
const Store   = require('../models/Store');

// ── Commission helpers (mirrors productController.js) ─────────────────────────
function calcRentCommission(rentPrice, advanceAmount) {
  const temp = rentPrice * 0.10;
  const gst  = (rentPrice + temp) * 0.18;
  const tx   = (rentPrice + gst + temp + advanceAmount) * 0.02;
  const raw  = temp + gst + tx + 100;
  return Math.ceil(raw / 50) * 50;
}

// ── Main ──────────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅  Connected to DB');

    const existingOrderId = process.argv[2];

    // ── MODE A: Re-run for an existing order ──────────────────────────────────
    if (existingOrderId) {
      console.log(`\n🔄  Re-running invoice for existing order: ${existingOrderId}`);
      await Order.findByIdAndUpdate(existingOrderId, { invoiceId: null });
      await processOrderConfirmation(existingOrderId);
      console.log('✅  Done — check your email / S3 for the new invoice.');
      return;
    }

    // ── MODE B: Create a brand-new synthetic test order ───────────────────────
    console.log('\n🆕  No order ID supplied — creating a synthetic test order…');

    // Grab the first available documents
    const customer = await User.findOne({});
    const product  = await Product.findOne({ listingType: 'rent' });
    const store    = await Store.findOne({});

    if (!customer || !product || !store) {
      console.error('❌  Could not find a User, Product (rent), or Store in the DB.');
      console.error('    Please seed the database first or pass an existing Order ID.');
      process.exit(1);
    }

    // ── Pricing values (tweak these to test different scenarios) ──────────────
    const rentPrice     = product.rentPrice    || 2000;
    const advanceAmount = product.advanceAmount || 5000;
    const deliveryCharge = 240;   // ← change to 0 to test "Free delivery"
    const deliveryCity   = 'Mysuru'; // ← change to any city name

    const commissionPrice = calcRentCommission(rentPrice, advanceAmount);
    const totalPrice      = rentPrice + commissionPrice + deliveryCharge;

    // ── Create the test order ─────────────────────────────────────────────────
    const testOrder = await Order.create({
      customer:       customer._id,
      product:        product._id,
      store:          store._id,
      listingType:    'rent',
      size:           'M',
      startDate:      new Date(),
      endDate:        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
      rentPrice,
      commissionPrice,
      salePrice:      0,
      advanceAmount,
      deliveryCharge,
      deliveryCity,
      totalPrice,
      status:         'confirmed',
      paymentStatus:  'paid',
      paymentMethod:  'PhonePe',
      paymentId:      `TEST-TXN-${Date.now()}`,
    });

    console.log(`\n📦  Test order created:`);
    console.log(`    Order ID      : ${testOrder._id}`);
    console.log(`    Customer      : ${customer.name || customer.email}`);
    console.log(`    Product       : ${product.name}`);
    console.log(`    Rent Price    : ₹${rentPrice}`);
    console.log(`    Commission    : ₹${commissionPrice}`);
    console.log(`    Total Rent    : ₹${rentPrice + commissionPrice}`);
    console.log(`    Advance       : ₹${advanceAmount} (refundable)`);
    console.log(`    Delivery      : ₹${deliveryCharge} (${deliveryCity})`);
    console.log(`    Grand Total   : ₹${rentPrice + commissionPrice + advanceAmount + deliveryCharge}`);
    console.log(`\n📄  Generating invoice…`);

    await processOrderConfirmation(testOrder._id.toString());

    console.log('\n✅  Invoice pipeline complete!');
    console.log('    → Check your email inbox');
    console.log('    → Check S3 bucket for the PDF');
    console.log(`    → Order ID: ${testOrder._id}  (save this for re-runs)`);
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌  Fatal error:', err);
    process.exit(1);
  });
