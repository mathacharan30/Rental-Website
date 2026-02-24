const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    slug:  { type: String, required: true, unique: true, trim: true, lowercase: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Store', storeSchema);
