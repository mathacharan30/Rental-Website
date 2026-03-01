const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    // listingType: 'rent' for all regular products; 'sale' for jewels sold outright
    listingType: { type: String, enum: ['rent', 'sale'], default: 'rent' },
    rentPrice: { type: Number, default: 0, min: 0 },
    commissionPrice: { type: Number, default: 0, min: 0 },
    salePrice: { type: Number, default: 0, min: 0 }, // only used when listingType === 'sale'
    price: { type: Number, min: 0 }, // computed: rentPrice + commissionPrice (rent) OR salePrice + commissionPrice (sale)
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
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', default: null }, // owning store
  },
  { timestamps: true }
);

// Auto-compute price before save
productSchema.pre('save', function (next) {
  if (this.listingType === 'sale') {
    // total = sale price + commission
    this.price = (this.salePrice || 0) + (this.commissionPrice || 0);
  } else {
    this.price = (this.rentPrice || 0) + (this.commissionPrice || 0);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);