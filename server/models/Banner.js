const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    category: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    type: { type: String, enum: ['hero', 'gallery'], default: 'gallery' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);