const mongoose       = require('mongoose');
const MakeupPackage  = require('../models/MakeupPackage');
const { s3, S3_BUCKET, deleteFromS3 } = require('../config/s3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl }     = require('@aws-sdk/s3-request-presigner');
const cache = require('../config/cache');

const SIGN_UPLOAD_ALLOWED_EXTS  = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const SIGN_UPLOAD_ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const VALID_TAGS = new Set(['most-booked', 'top-rated', 'popular-choice', 'new']);

// Cache key: scoped to category so invalidation is surgical
const pkgCacheKey = (categoryId) => `makeup-packages:${categoryId || 'all'}`;

// GET /api/makeup-packages/sign-upload
exports.signMakeupPackageUpload = async (req, res) => {
  try {
    const { filename, contentType } = req.query;
    if (!filename) return res.status(400).json({ message: 'filename is required' });

    const ext = filename.includes('.')
      ? filename.substring(filename.lastIndexOf('.')).toLowerCase()
      : '';
    if (!SIGN_UPLOAD_ALLOWED_EXTS.has(ext))
      return res.status(400).json({ message: 'Invalid file extension' });

    const baseName = filename
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9\-_]/g, '-')
      .slice(0, 80);

    const safeType = SIGN_UPLOAD_ALLOWED_TYPES.has(contentType) ? contentType : 'image/jpeg';
    const key = `makeup-packages/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${baseName}${ext}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: safeType,
      CacheControl: 'public, max-age=31536000, immutable',
    });
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const publicUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return res.json({ presignedUrl, publicUrl, key });
  } catch (err) {
    console.error('[MakeupPackage] signUpload error:', err.message);
    return res.status(500).json({ message: 'Failed to generate presigned URL' });
  }
};

// GET /api/makeup-packages?category=id&subcategory=name
exports.getMakeupPackages = async (req, res) => {
  try {
    const query = {};
    if (req.query.category) {
      if (!mongoose.Types.ObjectId.isValid(req.query.category)) {
        return res.json([]);
      }
      query.category = req.query.category;
    }
    if (req.query.subcategory) query.subcategory = req.query.subcategory;

    // Only cache category-scoped requests (no subcategory filter) — subcategory filtering is client-side
    const cacheKey = !req.query.subcategory ? pkgCacheKey(req.query.category) : null;
    if (cacheKey) {
      const cached = await cache.get(cacheKey);
      if (cached) return res.json(cached);
    }

    const packages = await MakeupPackage.find(query)
      .populate('category', 'name subcategories')
      .sort({ createdAt: -1 });

    if (cacheKey) await cache.set(cacheKey, packages, 300);
    return res.json(packages);
  } catch (err) {
    console.error('[MakeupPackage] Fetch error:', err.message);
    res.status(500).json({ message: 'Server error fetching makeup packages' });
  }
};

// GET /api/makeup-packages/:id
exports.getMakeupPackageById = async (req, res) => {
  try {
    const pkg = await MakeupPackage.findById(req.params.id).populate('category', 'name subcategories');
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    return res.json(pkg);
  } catch (err) {
    console.error('[MakeupPackage] GetById error:', err.message);
    res.status(500).json({ message: 'Server error fetching package' });
  }
};

// POST /api/makeup-packages
exports.createMakeupPackage = async (req, res) => {
  try {
    const {
      category, subcategory, name, artistName, tag,
      pricing, images, packageDetails, shortDescription, complimentary,
    } = req.body;

    if (!category) return res.status(400).json({ message: 'Category is required' });
    if (!name)     return res.status(400).json({ message: 'Name is required' });

    const safeTag = tag && VALID_TAGS.has(tag) ? tag : null;
    const safeImages = Array.isArray(images)
      ? images.filter((img) => img && img.url && img.publicId).slice(0, 4)
      : [];

    const pkg = await MakeupPackage.create({
      category,
      subcategory: subcategory || null,
      name: name.trim(),
      artistName: artistName?.trim() || undefined,
      tag: safeTag,
      pricing: {
        actualPrice: Number(pricing?.actualPrice) || 0,
        offerPrice:  Number(pricing?.offerPrice)  || 0,
        commission:  Number(pricing?.commission)   || 0,
        totalPrice:  Number(pricing?.totalPrice)   || 0,
      },
      images: safeImages,
      packageDetails:  packageDetails?.trim()  || undefined,
      shortDescription: shortDescription?.trim() || undefined,
      complimentary: Array.isArray(complimentary) ? complimentary.map((c) => c.trim()).filter(Boolean) : [],
    });

    await Promise.all([
      cache.invalidate(pkgCacheKey(category)),
      cache.invalidate(pkgCacheKey(null)),
    ]);

    return res.status(201).json(pkg);
  } catch (err) {
    console.error('[MakeupPackage] Create error:', err.message);
    res.status(500).json({ message: 'Server error creating package' });
  }
};

// PUT /api/makeup-packages/:id
exports.updateMakeupPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category, name, artistName, subcategory, tag, pricing,
      images, packageDetails, shortDescription, complimentary,
    } = req.body;

    const pkg = await MakeupPackage.findById(id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    // Delete S3 images that were removed
    if (Array.isArray(images)) {
      const incomingIds = new Set(images.map((img) => img.publicId).filter(Boolean));
      for (const old of pkg.images) {
        if (!incomingIds.has(old.publicId)) {
          try { await deleteFromS3(old.publicId); } catch { /* ignore */ }
        }
      }
      pkg.images = images.filter((img) => img && img.url && img.publicId).slice(0, 4);
    }

    const oldCategoryId = pkg.category.toString();
    if (category && mongoose.Types.ObjectId.isValid(category)) pkg.category = category;
    if (name)                  pkg.name              = name.trim();
    if (artistName !== undefined) pkg.artistName     = artistName?.trim() || undefined;
    if (subcategory !== undefined) pkg.subcategory   = subcategory || null;
    if (tag !== undefined)     pkg.tag               = tag && VALID_TAGS.has(tag) ? tag : null;
    if (pricing)               pkg.pricing           = {
      actualPrice: Number(pricing.actualPrice) || 0,
      offerPrice:  Number(pricing.offerPrice)  || 0,
      commission:  Number(pricing.commission)  || 0,
      totalPrice:  Number(pricing.totalPrice)  || 0,
    };
    if (packageDetails  !== undefined) pkg.packageDetails  = packageDetails?.trim()  || undefined;
    if (shortDescription !== undefined) pkg.shortDescription = shortDescription?.trim() || undefined;
    if (Array.isArray(complimentary))   pkg.complimentary    = complimentary.map((c) => c.trim()).filter(Boolean);

    await pkg.save();

    await Promise.all([
      cache.invalidate(pkgCacheKey(oldCategoryId)),
      cache.invalidate(pkgCacheKey(pkg.category.toString())),
      cache.invalidate(pkgCacheKey(null)),
    ]);

    return res.json(pkg);
  } catch (err) {
    console.error('[MakeupPackage] Update error:', err.message);
    res.status(500).json({ message: 'Server error updating package' });
  }
};

// DELETE /api/makeup-packages/:id
exports.deleteMakeupPackage = async (req, res) => {
  try {
    const pkg = await MakeupPackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    for (const img of pkg.images) {
      try { await deleteFromS3(img.publicId); } catch { /* ignore */ }
    }

    const categoryId = pkg.category.toString();
    await pkg.deleteOne();

    await Promise.all([
      cache.invalidate(pkgCacheKey(categoryId)),
      cache.invalidate(pkgCacheKey(null)),
    ]);

    return res.json({ message: 'Package deleted successfully' });
  } catch (err) {
    console.error('[MakeupPackage] Delete error:', err.message);
    res.status(500).json({ message: 'Server error deleting package' });
  }
};
