const Category = require('../models/Category');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('[Category] Fetch error:', error.message);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

// POST /api/categories (admin only) — accepts multipart/form-data with single file field 'image'
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    const image = { url: req.file.path, publicId: req.file.filename };
    const category = await Category.create({ name: name.trim(), description, image });
    res.status(201).json(category);
  } catch (error) {
    console.error('[Category] Create error:', error.message);
    res.status(500).json({ message: 'Server error creating category' });
  }
};

// GET /api/categories/:id/products
exports.getProductsByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await Product.find({ category: id }).populate('category').sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('[Category] Products fetch error:', error.message);
    res.status(500).json({ message: 'Server error fetching category products' });
  }
};

// DELETE /api/categories/:id (admin only) — deletes category and all its products (and their images)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Fetch products to delete and remove their images from Cloudinary
    const products = await Product.find({ category: id });
    for (const product of products) {
      if (product.images && product.images.length) {
        for (const img of product.images) {
          try {
            await cloudinary.uploader.destroy(img.publicId);
          } catch (err) {
            console.error(`[Cloudinary] Error deleting product image ${img.publicId}:`, err.message);
          }
        }
      }
      try {
        await product.deleteOne();
      } catch (err) {
        console.error(`[Products] Error deleting product ${product._id.toString()}:`, err.message);
      }
    }

    // Delete category image from Cloudinary if present
    if (category.image && category.image.publicId) {
      try {
        await cloudinary.uploader.destroy(category.image.publicId);
      } catch (err) {
        console.error(`[Cloudinary] Error deleting category image ${category.image.publicId}:`, err.message);
      }
    }

    await category.deleteOne();
    return res.json({ message: 'Category and its products deleted successfully' });
  } catch (error) {
    console.error('[Category] Delete error:', error.message);
    res.status(500).json({ message: 'Server error deleting category' });
  }
};