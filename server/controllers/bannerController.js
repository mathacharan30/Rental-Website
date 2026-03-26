const Banner = require('../models/Banner');
const { s3, S3_BUCKET, deleteFromS3 } = require('../config/s3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');

// GET /api/banners/sign-upload  (protected – store_owner / super_admin)
// Returns a presigned S3 PUT URL so the browser can upload directly to S3.
// No image bytes pass through this server (bypasses Vercel's 4.5 MB limit).
exports.signBannerUpload = async (req, res) => {
  try {
    const { filename, contentType } = req.query;
    if (!filename) {
      return res.status(400).json({ message: 'filename query param is required' });
    }

    const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : '';
    const baseName = filename.replace(/\.[^.]+$/, '').replace(/\s+/g, '-');
    const key = `banners/${Date.now()}-${baseName}${ext}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType || 'image/jpeg',
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
// Accepts { imageUrl, imagePublicId, title, category, type } as JSON body.
// The browser already uploaded the image directly to S3 via the presigned URL.
exports.uploadBanner = async (req, res) => {
  try {
    const { imageUrl, imagePublicId, title, category, type } = req.body;

    if (!imageUrl || !imagePublicId) {
      return res.status(400).json({ message: 'imageUrl and imagePublicId are required' });
    }

    const banner = await Banner.create({
      title,
      category,
      imageUrl,
      imagePublicId,
      type: type === 'hero' ? 'hero' : 'gallery',
    });

    console.log('[Banner] Upload Success:', imagePublicId);

    return res.status(201).json({
      message: 'Banner uploaded successfully',
      banner: {
        title: banner.title,
        category: banner.category,
        imageUrl: banner.imageUrl,
        imagePublicId: banner.imagePublicId,
        _id: banner._id,
      },
    });
  } catch (error) {
    console.error('[Banner] Upload Error:', error.message);
    return res.status(500).json({ message: 'Server error uploading banner' });
  }
};

// GET /api/banners?type=hero|gallery
exports.getBanners = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type === 'hero' || req.query.type === 'gallery') {
      filter.type = req.query.type;
    }
    const banners = await Banner.find(filter).sort({ createdAt: -1 });
    res.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
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