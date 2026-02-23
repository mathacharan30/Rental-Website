const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    rentPrice: { type: Number, required: true, min: 0 },
    commissionPrice: { type: Number, required: true, min: 0 },
    price: { type: Number, min: 0 }, // computed: rentPrice + commissionPrice
    advanceAmount: { type: Number, default: 0, min: 0 },
    description: { type: String },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-compute price = rentPrice + commissionPrice before save
productSchema.pre('save', function (next) {
  this.price = (this.rentPrice || 0) + (this.commissionPrice || 0);
  next();
});

module.exports = mongoose.model('Product', productSchema);