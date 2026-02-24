const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    uid:       { type: String, required: true, unique: true }, // Firebase UID
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    role:      { type: String, enum: ['super_admin', 'store_owner', 'customer'], required: true },
    storeName: { type: String, trim: true, default: null },                         // URL slug – store_owner only
    storeId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Store', default: null }, // FK to Store collection
    name:      { type: String, trim: true, default: null },
    phone:     { type: String, trim: true, default: null },
    address:   { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);