const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // hashed
    role: { type: String, enum: ['user'], default: 'user' },
    refreshTokens: [{ type: String }], // active refresh tokens for rotation
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);