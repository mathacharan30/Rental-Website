const Testimonial = require('../models/Testimonial');

// POST /api/testimonials
exports.createTestimonial = async (req, res) => {
  try {
    const { userName, handle, comment, rating, product, isTop } = req.body;

    if (!userName || !comment || !rating || !product) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const testimonial = new Testimonial({
      userName,
      handle,
      comment,
      rating,
      product,
      isTop: typeof isTop === 'string' ? ['true', '1', 'on'].includes(isTop.toLowerCase()) : Boolean(isTop),
    });
    const saved = await testimonial.save();
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
    const filter = {};
    if (top === 'true' || top === '1') filter.isTop = true;

    let query = Testimonial.find(filter).populate('product', 'name');
    query = query.sort({ createdAt: -1 });
    const lim = Number(limit);
    if (!Number.isNaN(lim) && lim > 0) query = query.limit(lim);

    const testimonials = await query.exec();
    return res.status(200).json(testimonials);
  } catch (error) {
    console.error('[Testimonials] Fetch all error:', error.message);
    return res.status(500).json({ message: 'Server error fetching testimonials' });
  }
};

// GET /api/testimonials/top/by-product
exports.getTopTestimonialsAcrossProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10);

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
    const updates = req.body;
    const updated = await Testimonial.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: 'Testimonial not found' });
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
    return res.status(200).json({ message: 'Testimonial deleted' });
  } catch (error) {
    console.error('[Testimonials] Delete error:', error.message);
    return res.status(500).json({ message: 'Server error deleting testimonial' });
  }
};
