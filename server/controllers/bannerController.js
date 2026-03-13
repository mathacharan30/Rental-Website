const Banner = require('../models/Banner');
const { deleteFromS3 } = require('../config/s3');

// POST /api/banners
exports.uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }
    const { title, category } = req.body;

    // multer-s3 already uploaded image, file.location is URL, file.key is S3 key
    const imageUrl = req.file.location;
    const imagePublicId = req.file.key; // S3 key e.g. banners/1700000000-image.jpg

    const banner = await Banner.create({
      title,
      category,
      imageUrl,
      imagePublicId,
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

// GET /api/banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
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