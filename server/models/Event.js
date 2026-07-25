const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    category: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    coverImage: {
      url: { type: String },
      publicId: { type: String },
    },
    startingPrice: { type: Number, default: 0, min: 0 },
    shortDescription: { type: String, trim: true },
    whatsIncluded: [{ type: String, trim: true }],
    bookBefore: { type: String, trim: true },
    serviceLocation: { type: String, trim: true },
    duration: { type: String, trim: true },
    gallery: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
