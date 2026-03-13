const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    image: {
      url: { type: String }, // S3 URL
      publicId: { type: String }, // S3 object key
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);