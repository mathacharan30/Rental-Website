const InstaPost = require('../models/InstaPost');

// POST /api/insta
exports.addPost = async (req, res) => {
  try {
    const { caption, postUrl } = req.body;
    if (!postUrl) {
      return res.status(400).json({ message: 'postUrl is required' });
    }

    const instaPost = await InstaPost.create({ caption, postUrl });
    console.log('[Insta] Add Success:', instaPost._id.toString());
    return res.status(201).json({
      message: 'Instagram post added successfully',
      post: instaPost,
    });
  } catch (error) {
    console.error('[Insta] Add Error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error adding Instagram post' });
  }
};

// GET /api/insta
exports.getPosts = async (req, res) => {
  try {
    const posts = await InstaPost.find().sort({ createdAt: -1 });
    return res.json(posts);
  } catch (error) {
    console.error('[Insta] Fetch Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching Instagram posts' });
  }
};

// DELETE /api/insta/:id
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await InstaPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Instagram post not found' });
    }

    await post.deleteOne();
    console.log('[Insta] Delete Success:', id);
    return res.json({ message: 'Instagram post deleted successfully' });
  } catch (error) {
    console.error('[Insta] Delete Error:', error.message);
    return res.status(500).json({ message: 'Server error deleting Instagram post' });
  }
};