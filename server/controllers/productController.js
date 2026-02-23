const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// GET /api/products
exports.getAllProducts = async (req, res) => {
  try {
  const products = await Product.find().populate('category').sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('[Products] Fetch error:', error.message);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      rentPrice: rentPriceRaw,
      commissionPrice: commissionPriceRaw,
      advanceAmount: advanceAmountRaw,
      description,
      available,
      stock: stockRaw,
      rating: ratingRaw,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }
    if (rentPriceRaw === undefined || rentPriceRaw === '') {
      return res.status(400).json({ message: 'Rent price is required' });
    }
    if (commissionPriceRaw === undefined || commissionPriceRaw === '') {
      return res.status(400).json({ message: 'Commission price is required' });
    }

    // Normalize fields
    const rentPrice = Number(rentPriceRaw);
    const commissionPrice = Number(commissionPriceRaw);
    const advanceAmount = advanceAmountRaw !== undefined && advanceAmountRaw !== '' ? Math.round(Number(advanceAmountRaw)) : 0;

    if (!Number.isFinite(rentPrice) || rentPrice < 0) {
      return res.status(400).json({ message: 'Invalid rent price' });
    }
    if (!Number.isFinite(commissionPrice) || commissionPrice < 0) {
      return res.status(400).json({ message: 'Invalid commission price' });
    }

    const availableBool = typeof available === 'string' ? available === 'true' : !!available;
    const stockNum = stockRaw === undefined || stockRaw === '' ? undefined : Number(stockRaw);
    const ratingNum = ratingRaw === undefined || ratingRaw === '' ? undefined : Number(ratingRaw);

    console.log('[Products] Create request body:', req.body);

    const images = [];
    if (req.files && req.files.length) {
      for (const file of req.files) {
        images.push({ url: file.path, publicId: file.filename });
      }
    }

    const payload = {
      name,
      category,
      rentPrice,
      commissionPrice,
      advanceAmount,
      // price is auto-computed by pre-save hook
      description,
      available: availableBool,
      images,
    };

    if (Number.isFinite(stockNum)) payload.stock = stockNum;
    if (Number.isFinite(ratingNum)) payload.rating = ratingNum;

    const product = await Product.create(payload);

    const populated = await product.populate('category');
    res.status(201).json(populated);
  } catch (error) {
    console.error('[Products] Create error:', error.message);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete all images from Cloudinary
    if (product.images && product.images.length) {
      for (const img of product.images) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
          console.log(`[Cloudinary] Deleted image ${img.publicId}`);
        } catch (cloudErr) {
          console.error('[Cloudinary] Deletion error:', cloudErr.message);
        }
      }
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[Products] Delete error:', error.message);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('[Products] GetById error:', error.message);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

// Top picks = products with rating >= 4, sorted by rating desc, limited to 10
exports.getTopPicks = async (req, res) => {
  try {
    const products = await Product.find({ rating: { $gte: 4 } })
      .sort({ rating: -1 })
      .limit(10)
      .populate('category');
    return res.status(200).json(products);
  } catch (error) {
    console.error('[Products] Top picks error:', error.message);
    return res.status(500).json({ message: 'Server error fetching top picks' });
  }
};