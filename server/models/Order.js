const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // ── Parties ───────────────────────────────────────────────────────────────
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    store:    { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },

    // ── Rental details ────────────────────────────────────────────────────────
    size:      { type: String, trim: true, default: '' },
    startDate: { type: Date, default: null },
    endDate:   { type: Date, default: null },

    // ── Pricing snapshot (frozen at order time so edits to the product don't
    //    affect existing orders) ──────────────────────────────────────────────
    rentPrice:       { type: Number, required: true },
    commissionPrice: { type: Number, required: true },
    advanceAmount:   { type: Number, default: 0 },
    totalPrice:      { type: Number, required: true }, // rentPrice + commissionPrice

    // ── Order status ──────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },

    // ── Payment (ready for gateway integration) ───────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: null }, // 'razorpay', 'cash', etc.
    paymentId:     { type: String, default: null }, // gateway transaction ID

    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
