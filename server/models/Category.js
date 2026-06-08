const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    listingMode: { type: String, enum: ["rent", "sale", "both"], default: "rent" },
    hasSizes: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);