const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // ── Identifiers ──────────────────────────────────────────────────────────
    userId:          { type: String, required: true },               // Firebase UID or DB user id
    merchantOrderId: { type: String, required: true, unique: true }, // UUID sent to PhonePe
    orderId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },

    // ── Money ────────────────────────────────────────────────────────────────
    amount: { type: Number, required: true }, // amount in PAISE

    // ── Status ───────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },

    // ── PhonePe response bodies (stored verbatim for audit) ──────────────────
    paymentDetails: { type: mongoose.Schema.Types.Mixed, default: null },
    refundDetails:  { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
