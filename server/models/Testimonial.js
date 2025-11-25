const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, trim: true },
    handle: { type: String, trim: true },
    comment: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    isTop: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
