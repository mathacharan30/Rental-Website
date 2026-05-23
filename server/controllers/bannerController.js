const Banner = require('../models/Banner');
const { s3, S3_BUCKET, deleteFromS3 } = require('../config/s3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const SIGN_UPLOAD_ALLOWED_EXTS  = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const SIGN_UPLOAD_ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// GET /api/banners/sign-upload  (protected – store_owner / super_admin)
// Returns a presigned S3 PUT URL so the browser can upload directly to S3.
// No image bytes pass through this server (bypasses Vercel's 4.5 MB limit).
exports.signBannerUpload = async (req, res) => {
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
    const key = `banners/${Date.now()}-${baseName}${ext}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: safeContentType,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const publicUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return res.json({ presignedUrl, publicUrl, key });
  } catch (error) {
    console.error('[Banner] signUpload error:', error.message);
    return res.status(500).json({ message: 'Failed to generate presigned upload URL' });
  }
};

// POST /api/banners
// Accepts { imageUrl, imagePublicId, title, caption, category, type, device } as JSON body.
// The browser already uploaded the image directly to S3 via the presigned URL.
exports.uploadBanner = async (req, res) => {
  try {
    const { imageUrl, imagePublicId, title, caption, category, type, device } = req.body;

    if (!imageUrl || !imagePublicId) {
      return res.status(400).json({ message: 'imageUrl and imagePublicId are required' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!caption || !caption.trim()) {
      return res.status(400).json({ message: 'Caption is required' });
    }

    const banner = await Banner.create({
      title: title.trim(),
      caption: caption.trim(),
      category,
      imageUrl,
      imagePublicId,
      type: type === 'hero' ? 'hero' : 'gallery',
      device: device === 'mobile' ? 'mobile' : 'desktop',
    });

    console.log('[Banner] Upload Success:', imagePublicId);

    return res.status(201).json({
      message: 'Banner uploaded successfully',
      banner: {
        _id: banner._id,
        title: banner.title,
        caption: banner.caption,
        category: banner.category,
        imageUrl: banner.imageUrl,
        imagePublicId: banner.imagePublicId,
        type: banner.type,
        device: banner.device,
      },
    });
  } catch (error) {
    console.error('[Banner] Upload Error:', error.message);
    return res.status(500).json({ message: 'Server error uploading banner' });
  }
};

// GET /api/banners?type=hero|gallery&device=mobile|desktop
exports.getBanners = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type === 'hero' || req.query.type === 'gallery') {
      filter.type = req.query.type;
    }
    if (req.query.device === 'mobile') {
      filter.device = 'mobile';
    } else if (req.query.device === 'desktop') {
      // Also match legacy records that were saved before the device field existed
      filter.$or = [{ device: 'desktop' }, { device: { $exists: false } }, { device: null }];
    }
    const banners = await Banner.find(filter).sort({ createdAt: -1 });
    return res.json(banners);
  } catch (error) {
    console.error('[Banner] Fetch Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching banners' });
  }
};

// DELETE /api/banners/:id
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    try {
      await deleteFromS3(banner.imagePublicId);
      console.log('[Banner] S3 Delete Success:', banner.imagePublicId);
    } catch (s3Err) {
      console.error('[Banner] S3 Delete Error:', s3Err.message);
    }

    await banner.deleteOne();
    return res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('[Banner] Delete Error:', error.message);
    return res.status(500).json({ message: 'Server error deleting banner' });
  }
};