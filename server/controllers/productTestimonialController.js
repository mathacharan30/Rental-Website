const ProductTestimonial = require('../models/ProductTestimonial');
const Order = require('../models/Order');

// @desc    Add a product testimonial
// @route   POST /api/product-testimonials
// @access  Private (Customers only)
const addTestimonial = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Product ID, rating, and comment are required' });
    }

    // Check if user has a completed order for this product
    const completedOrder = await Order.findOne({
      customer: req.user.dbId,
      product: productId,
      status: 'completed'
    });

    if (!completedOrder) {
      return res.status(403).json({ message: 'You can only review products you have successfully ordered and completed.' });
    }

    const image = req.file ? req.file.location : null;

    const testimonial = new ProductTestimonial({
      user: req.user.dbId,
      product: productId,
      rating: Number(rating),
      comment,
      image
    });

    await testimonial.save();
    res.status(201).json({ message: 'Testimonial added successfully', testimonial });

  } catch (error) {
    console.error('[addTestimonial]', error);
    res.status(500).json({ message: 'Server error adding testimonial' });
  }
};

// @desc    Get all testimonials for a specific product
// @route   GET /api/product-testimonials/product/:productId
// @access  Public
const getTestimonialsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Fetch approved testimonials. Sort by newest first.
    const testimonials = await ProductTestimonial.find({ product: productId, isApproved: true })
      .sort({ createdAt: -1 })
      .populate('user', 'name profilePicture email') // Assuming user model has these fields
      .exec();

    res.status(200).json(testimonials);

  } catch (error) {
    console.error('[getTestimonialsByProduct]', error);
    res.status(500).json({ message: 'Server error fetching testimonials' });
  }
};

module.exports = {
  addTestimonial,
  getTestimonialsByProduct
};
