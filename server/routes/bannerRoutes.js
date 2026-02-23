const express = require('express');
const router = express.Router();
const { uploadBanner, getBanners, deleteBanner } = require('../controllers/bannerController');
const { bannerUpload }    = require('../middlewares/upload');
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { allowRoles }      = require('../middlewares/roleMiddleware');

const storeGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['store_owner', 'super_admin'])];

router.post('/',    ...storeGuard, bannerUpload.single('image'), uploadBanner);
router.get('/',     getBanners);
router.delete('/:id', ...storeGuard, deleteBanner);

module.exports = router;