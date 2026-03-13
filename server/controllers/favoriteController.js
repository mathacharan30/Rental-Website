const Favorite = require('../models/Favorite');
const Product = require('../models/Product');

// GET /api/favorites - Get all favorites for the logged-in customer
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.dbId; // MongoDB user ID from attachUserRole middleware

    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: 'product',
        populate: { path: 'category', select: 'name' }
      })
      .sort({ createdAt: -1 });

    // Filter out favorites where product was deleted
    const validFavorites = favorites.filter(fav => fav.product !== null);

    res.json(validFavorites);
  } catch (error) {
    console.error('[Favorites] Get error:', error.message);
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
};

// POST /api/favorites - Add a product to favorites
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.dbId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({ user: userId, product: productId });
    if (existing) {
      return res.status(409).json({ message: 'Product already in favorites' });
    }

    // Create favorite
    const favorite = await Favorite.create({ user: userId, product: productId });
    const populated = await Favorite.findById(favorite._id)
      .populate({
        path: 'product',
        populate: { path: 'category', select: 'name' }
      });

    res.status(201).json(populated);
  } catch (error) {
    console.error('[Favorites] Add error:', error.message);
    res.status(500).json({ message: 'Server error adding favorite' });
  }
};

// DELETE /api/favorites/:productId - Remove a product from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.dbId;
    const { productId } = req.params;

    const favorite = await Favorite.findOneAndDelete({ user: userId, product: productId });
    
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('[Favorites] Remove error:', error.message);
    res.status(500).json({ message: 'Server error removing favorite' });
  }
};

// GET /api/favorites/check/:productId - Check if a product is favorited
exports.checkFavorite = async (req, res) => {
  try {
    const userId = req.user.dbId;
    const { productId } = req.params;

    const favorite = await Favorite.findOne({ user: userId, product: productId });
    
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('[Favorites] Check error:', error.message);
    res.status(500).json({ message: 'Server error checking favorite' });
  }
};

