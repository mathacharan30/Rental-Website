const Category = require('../models/Category');
const Product = require('../models/Product');
const { s3, S3_BUCKET, deleteFromS3 } = require('../config/s3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const SIGN_UPLOAD_ALLOWED_EXTS  = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const SIGN_UPLOAD_ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// GET /api/categories/sign-upload  (protected – store_owner / super_admin)
// Returns a presigned S3 PUT URL so the browser uploads directly to S3.
exports.signCategoryUpload = async (req, res) => {
  try {
    const { filename, contentType } = req.query;
    if (!filename) {
      return res.status(400).json({ message: 'filename query param is required' });
    }

    const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')).toLowerCase() : '';
    if (!SIGN_UPLOAD_ALLOWED_EXTS.has(ext)) {
      return res.status(400).json({ message: 'Invalid file extension. Allowed: jpg, jpeg, png, webp, gif' });
    }

    const baseName = filename
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9\-_]/g, '-')
      .slice(0, 80);

    const safeContentType = SIGN_UPLOAD_ALLOWED_TYPES.has(contentType) ? contentType : 'image/jpeg';
    const key = `categories/${Date.now()}-${baseName}${ext}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: safeContentType,
    });
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const publicUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return res.json({ presignedUrl, publicUrl, key });
  } catch (error) {
    console.error('[Category] signUpload error:', error.message);
    return res.status(500).json({ message: 'Failed to generate presigned upload URL' });
  }
};

// GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    res.json(categories);
  } catch (error) {
    console.error('[Category] Fetch error:', error.message);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

// POST /api/categories (admin only) — accepts JSON { name, description, imageUrl, imagePublicId }
exports.createCategory = async (req, res) => {
  try {
    const { name, description, imageUrl, imagePublicId } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!imageUrl || !imagePublicId) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    const image = { url: imageUrl, publicId: imagePublicId };
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
    const { page = 1, limit = 10, search } = req.query;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10))); // Max 100 items per page
    const skip = (pageNum - 1) * limitNum;

    // Build the query object
    const { listingType } = req.query;
    let query = { category: id };
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.name = searchRegex;
    }
    if (listingType === "sale") {
      query.listingType = "sale";
    } else if (listingType === "rent") {
      // Match explicit "rent" OR documents where listingType was never set
      query.$or = [
        { listingType: "rent" },
        { listingType: { $exists: false } },
        { listingType: null },
      ];
    }

    // Get total count for pagination metadata
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNum);

    // Fetch paginated products
    const products = await Product.find(query)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.set("Cache-Control", "no-store");
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

    // If a new image was uploaded directly to S3, delete old one and update
    const { imageUrl, imagePublicId } = req.body;
    if (imageUrl && imagePublicId) {
      if (category.image && category.image.publicId) {
        try {
          await deleteFromS3(category.image.publicId);
          console.log('[Category] Old image deleted from S3:', category.image.publicId);
        } catch (err) {
          console.error('[Category] Error deleting old image from S3:', err.message);
        }
      }
      category.image = { url: imageUrl, publicId: imagePublicId };
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