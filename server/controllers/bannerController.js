const Banner = require('../models/Banner');
const cloudinary = require('../config/cloudinary');

// POST /api/banners
exports.uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }
    const { title, category } = req.body;

    // multer-storage-cloudinary already uploaded image, file.path is URL, file.filename is public_id (with folder)
    const imageUrl = req.file.path;
    const imagePublicId = req.file.filename; // includes folder e.g. banners/diwali/<id>

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
      await cloudinary.uploader.destroy(banner.imagePublicId);
      console.log('[Banner] Delete Success:', banner.imagePublicId);
    } catch (cloudErr) {
      console.error('[Banner] Cloudinary Delete Error:', cloudErr.message);
    }

    await banner.deleteOne();
    return res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('[Banner] Delete Error:', error.message);
    return res.status(500).json({ message: 'Server error deleting banner' });
  }
};