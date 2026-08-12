const mongoose = require('mongoose');

// Store location cities — managed by super admin, referenced by Store.city
// and used to filter products by city on category pages.
const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('City', citySchema);
