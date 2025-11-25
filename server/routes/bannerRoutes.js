const express = require('express');
const router = express.Router();
const { uploadBanner, getBanners, deleteBanner } = require('../controllers/bannerController');
const { bannerUpload } = require('../middlewares/upload');

router.post('/', bannerUpload.single('image'), uploadBanner);
router.get('/', getBanners);
router.delete('/:id', deleteBanner);

module.exports = router;