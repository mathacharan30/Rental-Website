const mongoose = require('mongoose');

const instagramUrlRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv)\/[A-Za-z0-9-_]+\/?/i;

const instaPostSchema = new mongoose.Schema(
  {
    caption: { type: String, trim: true },
    postUrl: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return instagramUrlRegex.test(v);
        },
        message: 'Invalid Instagram post URL',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InstaPost', instaPostSchema);