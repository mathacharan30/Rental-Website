const Category = require('../models/Category');
const Product = require('../models/Product');
const { deleteFromS3 } = require('../config/s3');

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

    const image = { url: req.file.location, publicId: req.file.key };
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
    const { page = 1, limit = 10 } = req.query;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10))); // Max 100 items per page
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination metadata
    const totalProducts = await Product.countDocuments({ category: id });
    const totalPages = Math.ceil(totalProducts / limitNum);

    // Fetch paginated products
    const products = await Product.find({ category: id })
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('[Category] Products fetch error:', error.message);
    res.status(500).json({ message: 'Server error fetching category products' });
  }
};

// PUT /api/categories/:id (admin only) — update category name and/or image
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if name is being changed and if it conflicts with another category
    if (name && name.trim() !== category.name) {
      const exists = await Category.findOne({ name: name.trim(), _id: { $ne: id } });
      if (exists) {
        return res.status(409).json({ message: 'Category name already exists' });
      }
      category.name = name.trim();
    }

    // Update description if provided
    if (description !== undefined) {
      category.description = description;
    }

    // If a new image file is uploaded, delete the old one and update
    if (req.file) {
      // Delete old image from S3 if it exists
      if (category.image && category.image.publicId) {
        try {
          await deleteFromS3(category.image.publicId);
          console.log('[Category] Old image deleted from S3:', category.image.publicId);
        } catch (err) {
          console.error('[Category] Error deleting old image from S3:', err.message);
        }
      }
      // Set new image
      category.image = { url: req.file.location, publicId: req.file.key };
    }

    await category.save();
    res.json(category);
  } catch (error) {
    console.error('[Category] Update error:', error.message);
    res.status(500).json({ message: 'Server error updating category' });
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

    // Fetch products to delete and remove their images from S3
    const products = await Product.find({ category: id });
    for (const product of products) {
      if (product.images && product.images.length) {
        for (const img of product.images) {
          try {
            await deleteFromS3(img.publicId);
          } catch (err) {
            console.error(`[S3] Error deleting product image ${img.publicId}:`, err.message);
          }
        }
      }
      try {
        await product.deleteOne();
      } catch (err) {
        console.error(`[Products] Error deleting product ${product._id.toString()}:`, err.message);
      }
    }

    // Delete category image from S3 if present
    if (category.image && category.image.publicId) {
      try {
        await deleteFromS3(category.image.publicId);
      } catch (err) {
        console.error(`[S3] Error deleting category image ${category.image.publicId}:`, err.message);
      }
    }

    await category.deleteOne();
    return res.json({ message: 'Category and its products deleted successfully' });
  } catch (error) {
    console.error('[Category] Delete error:', error.message);
    res.status(500).json({ message: 'Server error deleting category' });
  }
};