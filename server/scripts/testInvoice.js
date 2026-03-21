require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { processOrderConfirmation } = require('../utils/invoiceService');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to DB");

    const orderId = "69b90bff4ca0b37e48f7bc36"; // Order ID for INV-2026-00003

    // Clear the invoiceId so it generates again
    await Order.findByIdAndUpdate(orderId, { invoiceId: null });

    console.log("Re-running for order:", orderId);
    await processOrderConfirmation(orderId);
    console.log("Finished processOrderConfirmation");
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
