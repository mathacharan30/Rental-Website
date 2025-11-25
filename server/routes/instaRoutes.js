const express = require('express');
const router = express.Router();
const { addPost, getPosts, deletePost } = require('../controllers/instaController');

router.post('/', addPost);
router.get('/', getPosts);
router.delete('/:id', deletePost);

module.exports = router;