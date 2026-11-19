const Testimonial = require('../models/Testimonial');
const cache = require('../config/cache');
const { s3, S3_BUCKET, deleteFromS3 } = require('../config/s3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const MAX_IMAGES = 3;
const IMAGE_PREFIX = 'testimonials/';
const SIGN_UPLOAD_ALLOWED_EXTS  = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const SIGN_UPLOAD_ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const publicUrlFor = (key) => `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

/**
 * Validates an `images` array from the client. Only photos uploaded through our
 * own sign-upload (our bucket, testimonials/ prefix) are accepted, so nobody can
 * point the home page at an arbitrary external image.
 * Returns { images } or { error }.
 */
function parseImages(raw) {
  if (raw === undefined) return { images: undefined };
  if (!Array.isArray(raw)) return { error: 'images must be an array' };
  if (raw.length > MAX_IMAGES) return { error: `A testimonial can have at most ${MAX_IMAGES} photos` };
  const images = [];
  for (const img of raw) {
    const publicId = String(img?.publicId || '');
    if (!publicId.startsWith(IMAGE_PREFIX) || publicId.includes('..')) {
      return { error: 'Invalid photo' };
    }
    images.push({ url: publicUrlFor(publicId), publicId });
  }
  return { images };
}

async function deleteImages(images = []) {
  for (const img of images) {
    try {
      await deleteFromS3(img.publicId);
    } catch (err) {
      console.error('[Testimonials] S3 delete failed:', img.publicId, err.message);
    }
  }
}

// GET /api/testimonials/sign-upload  (store_owner / super_admin)
// Presigned S3 PUT URL so the browser uploads the photo directly to S3.
exports.signTestimonialUpload = async (req, res) => {
  try {
    const { filename, contentType } = req.query;
    if (!filename) return res.status(400).json({ message: 'filename query param is required' });

    const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')).toLowerCase() : '';
    if (!SIGN_UPLOAD_ALLOWED_EXTS.has(ext)) {
      return res.status(400).json({ message: 'Invalid file type. Allowed: jpg, jpeg, png, webp' });
    }
    const baseName = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9\-_]/g, '-').slice(0, 60);
    const safeContentType = SIGN_UPLOAD_ALLOWED_TYPES.has(contentType) ? contentType : 'image/jpeg';
    const key = `${IMAGE_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}${ext}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: safeContentType,
      CacheControl: 'public, max-age=31536000, immutable',
    });
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    return res.json({ presignedUrl, publicUrl: publicUrlFor(key), key });
  } catch (error) {
    console.error('[Testimonials] signUpload error:', error.message);
    return res.status(500).json({ message: 'Failed to generate upload URL' });
  }
};

// POST /api/testimonials
exports.createTestimonial = async (req, res) => {
  try {
    const { userName, handle, comment, rating, product, isTop } = req.body;

    if (!userName || !comment || !rating || !product) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const { images, error } = parseImages(req.body.images);
    if (error) return res.status(400).json({ message: error });

    const testimonial = new Testimonial({
      userName,
      handle,
      comment,
      rating,
      product,
      images: images || [],
      isTop: typeof isTop === 'string' ? ['true', '1', 'on'].includes(isTop.toLowerCase()) : Boolean(isTop),
    });
    const saved = await testimonial.save();
    await cache.invalidatePattern('testimonials:*');
    return res.status(201).json(saved);
  } catch (error) {
    console.error('[Testimonials] Create error:', error.message);
    return res.status(500).json({ message: 'Server error creating testimonial' });
  }
};

// GET /api/testimonials
exports.getAllTestimonials = async (req, res) => {
  try {
    const { top, limit } = req.query;
    const cacheKey = `testimonials:list:${top || ''}:${limit || ''}`;

    const cached = await cache.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const filter = {};
    if (top === 'true' || top === '1') filter.isTop = true;

    let query = Testimonial.find(filter).populate('product', 'name');
    query = query.sort({ createdAt: -1 });
    const lim = Number(limit);
    if (!Number.isNaN(lim) && lim > 0) query = query.limit(lim);

    const testimonials = await query.exec();
    await cache.set(cacheKey, testimonials, 120);
    return res.status(200).json(testimonials);
  } catch (error) {
    console.error('[Testimonials] Fetch all error:', error.message);
    return res.status(500).json({ message: 'Server error fetching testimonials' });
  }
};

// GET /api/testimonials/top/by-product
exports.getTopTestimonialsAcrossProducts = async (req, res) => {
  try {
    const limitRaw = req.query.limit || '';
    const cacheKey = `testimonials:top:${limitRaw}`;

    const cached = await cache.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const limit = parseInt(limitRaw, 10);

    const pipeline = [
      { $match: { isTop: true } },
      { $sort: { createdAt: -1, rating: -1, _id: -1 } },
      { $group: { _id: "$product", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
      { $sort: { createdAt: -1 } },
    ];

    if (!Number.isNaN(limit) && limit > 0) {
      pipeline.push({ $limit: limit });
    }

    const results = await Testimonial.aggregate(pipeline);
    await Testimonial.populate(results, { path: 'product', select: 'name' });

    await cache.set(cacheKey, results, 120);
    return res.status(200).json(results);
  } catch (error) {
    console.error('[Testimonials] Top by product error:', error.message);
    return res.status(500).json({ message: 'Server error fetching top testimonials by product' });
  }
};


// GET /api/testimonials/product/:productId
exports.getTestimonialsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const testimonials = await Testimonial.find({ product: productId }).sort({ createdAt: -1 });
    return res.status(200).json(testimonials);
  } catch (error) {
    console.error('[Testimonials] Fetch by product error:', error.message);
    return res.status(500).json({ message: 'Server error fetching testimonials for product' });
  }
};

// PUT /api/testimonials/:id
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    // Whitelist allowed fields — never pass raw req.body to the DB
    const { userName, handle, comment, rating, isTop } = req.body;
    const updates = {};
    if (userName !== undefined) updates.userName = String(userName).trim().slice(0, 100);
    if (handle   !== undefined) updates.handle   = String(handle).trim().slice(0, 50);
    if (comment  !== undefined) updates.comment  = String(comment).trim().slice(0, 1000);
    if (rating   !== undefined) {
      const r = Number(rating);
      if (!Number.isFinite(r) || r < 1 || r > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      updates.rating = r;
    }
    if (isTop !== undefined) updates.isTop = Boolean(isTop);

    const { images, error } = parseImages(req.body.images);
    if (error) return res.status(400).json({ message: error });

    const existing = await Testimonial.findById(id).select('images');
    if (!existing) return res.status(404).json({ message: 'Testimonial not found' });
    if (images !== undefined) updates.images = images;

    const updated = await Testimonial.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Testimonial not found' });

    // Remove photos that were taken off this testimonial from S3
    if (images !== undefined) {
      const kept = new Set(images.map((i) => i.publicId));
      await deleteImages((existing.images || []).filter((i) => !kept.has(i.publicId)));
    }

    await cache.invalidatePattern('testimonials:*');
    return res.status(200).json(updated);
  } catch (error) {
    console.error('[Testimonials] Update error:', error.message);
    return res.status(500).json({ message: 'Server error updating testimonial' });
  }
};

// DELETE /api/testimonials/:id
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Testimonial.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Testimonial not found' });
    await deleteImages(deleted.images);
    await cache.invalidatePattern('testimonials:*');
    return res.status(200).json({ message: 'Testimonial deleted' });
  } catch (error) {
    console.error('[Testimonials] Delete error:', error.message);
    return res.status(500).json({ message: 'Server error deleting testimonial' });
  }
};
