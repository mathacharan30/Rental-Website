const mongoose = require('mongoose');

const productTestimonialSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    image: { type: String, default: null },
    isApproved: { type: Boolean, default: true } // Auto-approve by default for now
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductTestimonial', productTestimonialSchema);
