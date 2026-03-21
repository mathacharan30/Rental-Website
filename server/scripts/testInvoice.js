require('dotenv').config();
const mongoose = require('mongoose');
const { processOrderConfirmation } = require('../utils/invoiceService');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to DB");

    const orderId = "69b90c38a83fefce7718a560"; // From the user's screenshot

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
