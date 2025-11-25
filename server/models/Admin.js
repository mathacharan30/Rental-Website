const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // hashed
    role: { type: String, enum: ['admin'], default: 'admin' },
    refreshTokens: [{ type: String }], // store active refresh tokens
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);