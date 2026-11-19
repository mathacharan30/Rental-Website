const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, trim: true },
    handle: { type: String, trim: true },
    comment: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    isTop: { type: Boolean, default: false },
    // Customer photos (max 3), uploaded straight to S3 under testimonials/
    images: {
      type: [
        {
          _id: false,
          url: { type: String, required: true },
          publicId: { type: String, required: true }, // S3 key
        },
      ],
      default: [],
      validate: [(v) => v.length <= 3, 'A testimonial can have at most 3 photos'],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
