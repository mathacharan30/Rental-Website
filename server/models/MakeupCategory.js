const mongoose = require('mongoose');

const makeupCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    subcategories: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('MakeupCategory', makeupCategorySchema);
