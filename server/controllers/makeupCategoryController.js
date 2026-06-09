const MakeupCategory = require('../models/MakeupCategory');
const MakeupPackage  = require('../models/MakeupPackage');
const { s3, S3_BUCKET, deleteFromS3 } = require('../config/s3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const cache = require('../config/cache');

const SIGN_UPLOAD_ALLOWED_EXTS  = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const SIGN_UPLOAD_ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const CACHE_KEY = 'makeup-categories';

// GET /api/makeup-categories/sign-upload
exports.signMakeupCategoryUpload = async (req, res) => {
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
    const key = `makeup-categories/${Date.now()}-${baseName}${ext}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: safeContentType,
      CacheControl: 'public, max-age=31536000, immutable',
    });
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const publicUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return res.json({ presignedUrl, publicUrl, key });
  } catch (error) {
    console.error('[MakeupCategory] signUpload error:', error.message);
    return res.status(500).json({ message: 'Failed to generate presigned upload URL' });
  }
};

// GET /api/makeup-categories
exports.getMakeupCategories = async (req, res) => {
  try {
    const cached = await cache.get(CACHE_KEY);
    if (cached) return res.json(cached);

    const categories = await MakeupCategory.find().sort({ name: 1 });
    await cache.set(CACHE_KEY, categories, 300);
    return res.json(categories);
  } catch (error) {
    console.error('[MakeupCategory] Fetch error:', error.message);
    res.status(500).json({ message: 'Server error fetching makeup categories' });
  }
};

// POST /api/makeup-categories
exports.createMakeupCategory = async (req, res) => {
  try {
    const { name, imageUrl, imagePublicId, subcategories } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!imageUrl || !imagePublicId) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const exists = await MakeupCategory.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).json({ message: 'Makeup category already exists' });
    }

    const parsedSubs = Array.isArray(subcategories) ? subcategories.map((s) => s.trim()).filter(Boolean) : [];

    const category = await MakeupCategory.create({
      name: name.trim(),
      image: { url: imageUrl, publicId: imagePublicId },
      subcategories: parsedSubs,
    });
    await cache.invalidate(CACHE_KEY);
    res.status(201).json(category);
  } catch (error) {
    console.error('[MakeupCategory] Create error:', error.message);
    res.status(500).json({ message: 'Server error creating makeup category' });
  }
};

// PUT /api/makeup-categories/:id
exports.updateMakeupCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, imageUrl, imagePublicId, subcategories } = req.body;

    const category = await MakeupCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Makeup category not found' });
    }

    if (name && name.trim() !== category.name) {
      const exists = await MakeupCategory.findOne({ name: name.trim(), _id: { $ne: id } });
      if (exists) {
        return res.status(409).json({ message: 'Makeup category name already exists' });
      }
      category.name = name.trim();
    }

    if (Array.isArray(subcategories)) {
      category.subcategories = subcategories.map((s) => s.trim()).filter(Boolean);
    }

    if (imageUrl && imagePublicId) {
      if (category.image && category.image.publicId) {
        try {
          await deleteFromS3(category.image.publicId);
        } catch (err) {
          console.error('[MakeupCategory] Error deleting old image from S3:', err.message);
        }
      }
      category.image = { url: imageUrl, publicId: imagePublicId };
    }

    await category.save();
    await cache.invalidate(CACHE_KEY);
    res.json(category);
  } catch (error) {
    console.error('[MakeupCategory] Update error:', error.message);
    res.status(500).json({ message: 'Server error updating makeup category' });
  }
};

// DELETE /api/makeup-categories/:id
exports.deleteMakeupCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await MakeupCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Makeup category not found' });
    }

    // Cascade: delete all related packages and their S3 images
    const packages = await MakeupPackage.find({ category: id });
    for (const pkg of packages) {
      for (const img of pkg.images) {
        try { await deleteFromS3(img.publicId); } catch { /* ignore */ }
      }
      await pkg.deleteOne();
    }

    // Delete category image
    if (category.image && category.image.publicId) {
      try {
        await deleteFromS3(category.image.publicId);
      } catch (err) {
        console.error(`[S3] Error deleting makeup category image ${category.image.publicId}:`, err.message);
      }
    }

    await category.deleteOne();
    await cache.invalidate(CACHE_KEY);
    return res.json({ message: 'Makeup category deleted successfully' });
  } catch (error) {
    console.error('[MakeupCategory] Delete error:', error.message);
    res.status(500).json({ message: 'Server error deleting makeup category' });
  }
};
