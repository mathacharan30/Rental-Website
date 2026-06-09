const mongoose = require('mongoose');

const makeupPackageSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MakeupCategory',
      required: true,
    },
    subcategory: { type: String, trim: true, default: null },
    name: { type: String, required: true, trim: true },
    artistName: { type: String, trim: true },
    tag: {
      type: String,
      enum: ['most-booked', 'top-rated', 'popular-choice', 'new'],
      default: null,
    },
    pricing: {
      actualPrice: { type: Number, default: 0, min: 0 },
      offerPrice:  { type: Number, default: 0, min: 0 },
      commission:  { type: Number, default: 0, min: 0 },
      totalPrice:  { type: Number, default: 0, min: 0 },
    },
    images: [
      {
        url:      { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    packageDetails:  { type: String, trim: true },
    shortDescription: { type: String, trim: true },
    complimentary: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('MakeupPackage', makeupPackageSchema);
